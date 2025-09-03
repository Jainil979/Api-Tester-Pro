from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
import requests , json
import time


def home(request):
    return render(request, 'tester/index.html')


@csrf_exempt
def api_proxy(request):
    if request.method == 'POST':
        try:
            # Parse the request data from our frontend
            data = JSONParser().parse(request)
            target_url = data['url']
            method = data['method'].lower()
            headers = data.get('headers', {})
            body_data = data.get('body', None)

            # Make the actual request to the external API
            start_time = time.time()
            response = requests.request(
                method=method,
                url=target_url,
                headers=headers,
                json=body_data if body_data else None
            )
            response_time = time.time() - start_time

            # Calculate response size in bytes
            response_size = len(response.content) if response.content else 0
            
            # Determine HTTP version from the response
            http_version = "HTTP/1.1"  # Default
            if hasattr(response.raw, 'version'):
                http_version = {10: 'HTTP/1.0', 11: 'HTTP/1.1', 20: 'HTTP/2'}.get(response.raw.version, 'HTTP/1.1')
            
            # Get status text based on status code
            status_texts = {
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
            status_text = status_texts.get(response.status_code, 'Unknown Status')

            # Build and return the response for our frontend
            proxy_response = {
                'status': response.status_code,
                'status_text': status_text,
                'headers': dict(response.headers),
                'body': response.json() if response.content and 'application/json' in response.headers.get('content-type', '') else response.text,
                'response_time': round(response_time * 1000, 2),  # Convert to milliseconds
                'size': response_size,
                'http_version': http_version
            }
            return JsonResponse(proxy_response)

        except requests.exceptions.RequestException as e:
            # Handle network errors
            return JsonResponse({'error': str(e)}, status=500)
        except json.JSONDecodeError:
            # Handle non-JSON responses
            try:
                return JsonResponse({
                    'error': 'Response is not valid JSON',
                    'raw_response': response.text[:500] + '...' if len(response.text) > 500 else response.text
                }, status=500)
            except:
                return JsonResponse({'error': 'Invalid response from server'}, status=500)
        except Exception as e:
            # Handle other exceptions
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only POST method is supported'}, status=405)