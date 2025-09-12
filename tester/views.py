# from django.shortcuts import render
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from rest_framework.parsers import JSONParser
# import requests , json
# import time


# def home(request):
#     return render(request, 'tester/index.html')


# @csrf_exempt
# def api_proxy(request):
#     if request.method == 'POST':
#         try:
#             # Parse the request data from our frontend
#             data = JSONParser().parse(request)
#             target_url = data['url']
#             method = data['method'].lower()
#             headers = data.get('headers', {})
#             body_data = data.get('body', None)

#             # Make the actual request to the external API
#             start_time = time.time()
#             response = requests.request(
#                 method=method,
#                 url=target_url,
#                 headers=headers,
#                 json=body_data if body_data else None
#             )
#             response_time = time.time() - start_time

#             # Calculate response size in bytes
#             response_size = len(response.content) if response.content else 0
            
#             # Determine HTTP version from the response
#             http_version = "HTTP/1.1"  # Default
#             if hasattr(response.raw, 'version'):
#                 http_version = {10: 'HTTP/1.0', 11: 'HTTP/1.1', 20: 'HTTP/2'}.get(response.raw.version, 'HTTP/1.1')
            
#             # Get status text based on status code
#             status_texts = {
#                 200: 'OK',
#                 201: 'Created',
#                 202: 'Accepted',
#                 204: 'No Content',
#                 301: 'Moved Permanently',
#                 302: 'Found',
#                 304: 'Not Modified',
#                 400: 'Bad Request',
#                 401: 'Unauthorized',
#                 403: 'Forbidden',
#                 404: 'Not Found',
#                 405: 'Method Not Allowed',
#                 500: 'Internal Server Error',
#                 502: 'Bad Gateway',
#                 503: 'Service Unavailable'
#             }
#             status_text = status_texts.get(response.status_code, 'Unknown Status')

#             # Build and return the response for our frontend
#             proxy_response = {
#                 'status': response.status_code,
#                 'status_text': status_text,
#                 'headers': dict(response.headers),
#                 'body': response.json() if response.content and 'application/json' in response.headers.get('content-type', '') else response.text,
#                 'response_time': round(response_time * 1000, 2),  # Convert to milliseconds
#                 'size': response_size,
#                 'http_version': http_version
#             }
#             return JsonResponse(proxy_response)

#         except requests.exceptions.RequestException as e:
#             # Handle network errors
#             return JsonResponse({'error': str(e)}, status=500)
#         except json.JSONDecodeError:
#             # Handle non-JSON responses
#             try:
#                 return JsonResponse({
#                     'error': 'Response is not valid JSON',
#                     'raw_response': response.text[:500] + '...' if len(response.text) > 500 else response.text
#                 }, status=500)
#             except:
#                 return JsonResponse({'error': 'Invalid response from server'}, status=500)
#         except Exception as e:
#             # Handle other exceptions
#             return JsonResponse({'error': str(e)}, status=500)
#     else:
#         return JsonResponse({'error': 'Only POST method is supported'}, status=405)







from django.shortcuts import render
import requests
import asyncio
import aiohttp
import json
import time
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.parsers import JSONParser
from concurrent.futures import ThreadPoolExecutor

# Create a thread pool executor for handling blocking I/O operations
thread_pool = ThreadPoolExecutor(max_workers=50)

# Cache for status texts to avoid recreating the dict every time
STATUS_TEXTS = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
}

# HTTP version mapping
HTTP_VERSIONS = {10: 'HTTP/1.0', 11: 'HTTP/1.1', 20: 'HTTP/2'}


def home(request):
    return render(request, 'tester/index.html')


@method_decorator(csrf_exempt, name='dispatch')
class APIProxyView(View):
    async def post(self, request):
        try:
            # Parse the request data from our frontend
            data = JSONParser().parse(request)
            target_url = data['url']
            method = data['method'].lower()
            headers = data.get('headers', {})
            body_data = data.get('body', None)
            
            # Use async HTTP client for better performance
            async with aiohttp.ClientSession() as session:
                start_time = time.time()
                
                # Prepare request parameters
                request_params = {
                    'method': method.upper(),
                    'url': target_url,
                    'headers': headers,
                    'ssl': False  # Disable SSL verification for faster testing (not for production)
                }
                
                # Add JSON body if provided
                if body_data:
                    request_params['json'] = body_data
                
                # Make the actual request to the external API
                async with session.request(**request_params) as response:
                    response_time = time.time() - start_time
                    
                    # Get response content
                    response_content = await response.read()
                    
                    # Calculate response size
                    response_size = len(response_content)
                    
                    # Determine HTTP version
                    http_version = HTTP_VERSIONS.get(getattr(response, 'version', 11), 'HTTP/1.1')
                    
                    # Get status text
                    status_text = STATUS_TEXTS.get(response.status, 'Unknown Status')
                    
                    # Parse response body based on content type
                    content_type = response.headers.get('content-type', '').lower()
                    if 'application/json' in content_type and response_content:
                        try:
                            body = json.loads(response_content.decode('utf-8'))
                        except json.JSONDecodeError:
                            body = response_content.decode('utf-8')
                    else:
                        body = response_content.decode('utf-8') if response_content else ''
                    
                    # Build and return the response for our frontend
                    proxy_response = {
                        'status': response.status,
                        'status_text': status_text,
                        'headers': dict(response.headers),
                        'body': body,
                        'response_time': round(response_time * 1000, 2),  # Convert to milliseconds
                        'size': response_size,
                        'http_version': http_version
                    }
                    
                    return JsonResponse(proxy_response)
                    
        except aiohttp.ClientError as e:
            # Handle client errors (network issues, etc.)
            return JsonResponse({'error': f'Client error: {str(e)}'}, status=500)
        except asyncio.TimeoutError:
            # Handle timeout errors
            return JsonResponse({'error': 'Request timeout'}, status=408)
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)



# Fallback synchronous version for compatibility
@csrf_exempt
def api_proxy_fallback(request):
    if request.method == 'POST':
        try:
            # Parse the request data from our frontend
            data = JSONParser().parse(request)
            target_url = data['url']
            method = data['method'].lower()
            headers = data.get('headers', {})
            body_data = data.get('body', None)
            
            # Use requests with connection pooling for better performance
            session = requests.Session()
            
            # Prepare request parameters
            request_params = {
                'method': method.upper(),
                'url': target_url,
                'headers': headers,
                'timeout': 30  # 30 second timeout
            }
            
            # Add JSON body if provided
            if body_data:
                request_params['json'] = body_data
            
            # Make the actual request to the external API
            start_time = time.time()
            response = session.request(**request_params)
            response_time = time.time() - start_time
            
            # Calculate response size
            response_size = len(response.content) if response.content else 0
            
            # Determine HTTP version
            http_version = "HTTP/1.1"  # Default
            if hasattr(response.raw, 'version'):
                http_version = HTTP_VERSIONS.get(response.raw.version, 'HTTP/1.1')
            
            # Get status text
            status_text = STATUS_TEXTS.get(response.status_code, 'Unknown Status')
            
            # Parse response body based on content type
            content_type = response.headers.get('content-type', '').lower()
            if 'application/json' in content_type and response.content:
                try:
                    body = response.json()
                except json.JSONDecodeError:
                    body = response.text
            else:
                body = response.text if response.content else ''
            
            # Build and return the response for our frontend
            proxy_response = {
                'status': response.status_code,
                'status_text': status_text,
                'headers': dict(response.headers),
                'body': body,
                'response_time': round(response_time * 1000, 2),  # Convert to milliseconds
                'size': response_size,
                'http_version': http_version
            }
            
            return JsonResponse(proxy_response)
            
        except requests.exceptions.RequestException as e:
            # Handle network errors
            return JsonResponse({'error': f'Network error: {str(e)}'}, status=500)
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Only POST method is supported'}, status=405)