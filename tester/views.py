
import json
import time
import socket
import ssl
import urllib.parse
import asyncio
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.parsers import JSONParser

STATUS_TEXTS = {
    200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content',
    301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden',
    404: 'Not Found', 405: 'Method Not Allowed',
    500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable'
}


def home(request):
    return render(request, 'tester/index.html')


def make_request_sync(method, url, headers, body):
    """
    Perform an HTTP request manually using sockets.
    Returns (response_dict, error_dict).
    """
    parsed = urllib.parse.urlparse(url)
    scheme = parsed.scheme.lower()
    host = parsed.hostname
    port = parsed.port or (443 if scheme == 'https' else 80)
    path = parsed.path or '/'
    if parsed.query:
        path += '?' + parsed.query

    # Timing accumulators (nanoseconds)
    dns_ns = tcp_ns = ssl_ns = send_ns = waiting_ns = download_ns = 0

    # ---- DNS Resolution ----
    dns_start_ns = time.perf_counter_ns()
    try:
        addr_list = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
        if not addr_list:
            raise Exception('No address found')
        family, socktype, proto, canonname, sockaddr = addr_list[0]
    except socket.gaierror as e:
        return None, {'error': f'DNS resolution failed: {str(e)}'}
    dns_ns = time.perf_counter_ns() - dns_start_ns

    # ---- TCP Connection ----
    sock = socket.socket(family, socktype)
    sock.settimeout(30)
    tcp_start_ns = time.perf_counter_ns()
    try:
        sock.connect(sockaddr)
    except socket.error as e:
        sock.close()
        return None, {'error': f'TCP connection failed: {str(e)}'}
    tcp_ns = time.perf_counter_ns() - tcp_start_ns

    # ---- SSL Handshake (if HTTPS) ----
    if scheme == 'https':
        ssl_start_ns = time.perf_counter_ns()
        try:
            context = ssl.create_default_context()
            context.check_hostname = False
            context.verify_mode = ssl.CERT_NONE
            sock = context.wrap_socket(sock, server_hostname=host)
        except ssl.SSLError as e:
            sock.close()
            return None, {'error': f'SSL handshake failed: {str(e)}'}
        ssl_ns = time.perf_counter_ns() - ssl_start_ns

    # ---- Build HTTP Request ----
    if 'Host' not in headers:
        headers['Host'] = host
    request_body_bytes = b''
    if body is not None:
        body_str = json.dumps(body) if isinstance(body, (dict, list)) else str(body)
        request_body_bytes = body_str.encode('utf-8')
        if 'Content-Type' not in headers:
            headers['Content-Type'] = 'application/json'
        headers['Content-Length'] = str(len(request_body_bytes))

    request_line = f"{method.upper()} {path} HTTP/1.1\r\n"
    header_lines = ''.join(f"{k}: {v}\r\n" for k, v in headers.items())
    request_bytes = request_line.encode() + header_lines.encode() + b'\r\n' + request_body_bytes

    # ---- Send Request ----
    send_start_ns = time.perf_counter_ns()
    try:
        sock.sendall(request_bytes)
    except socket.error as e:
        sock.close()
        return None, {'error': f'Failed to send request: {str(e)}'}
    send_ns = time.perf_counter_ns() - send_start_ns

    # ---- Receive Response ----
    response_data = b''
    first_byte = True
    receive_start_ns = time.perf_counter_ns()
    try:
        # Read headers (until double CRLF)
        while b'\r\n\r\n' not in response_data:
            chunk = sock.recv(4096)
            if not chunk:
                raise Exception('Connection closed before headers complete')
            if first_byte:
                waiting_ns = time.perf_counter_ns() - receive_start_ns
                first_byte = False
            response_data += chunk

        # Split headers and any already received body bytes
        header_end = response_data.index(b'\r\n\r\n')
        headers_section = response_data[:header_end]
        body_so_far = response_data[header_end + 4:]

        # Parse status line
        lines = headers_section.split(b'\r\n')
        if not lines:
            raise Exception('No status line')
        status_line = lines[0].decode('utf-8', errors='replace')
        parts = status_line.split(' ', 2)
        if len(parts) < 2:
            raise Exception(f'Invalid status line: {status_line}')
        status_code = int(parts[1])
        status_text = STATUS_TEXTS.get(status_code, 'Unknown Status')
        http_version = parts[0] if len(parts) > 0 else 'HTTP/1.1'

        # Parse headers dict
        resp_headers = {}
        for line in lines[1:]:
            line = line.decode('utf-8', errors='replace')
            if ':' in line:
                key, value = line.split(':', 1)
                resp_headers[key.strip()] = value.strip()

        # ---- Determine how to read the body ----
        content_length = None
        if 'Content-Length' in resp_headers:
            content_length = int(resp_headers['Content-Length'])
        transfer_encoding = resp_headers.get('Transfer-Encoding', '').lower()

        full_body_bytes = b''

        if method.upper() == 'HEAD':
            # HEAD responses MUST NOT have a body
            full_body_bytes = b''
            download_ns = 0

        elif content_length is not None:
            # Read exactly Content-Length bytes
            full_body_bytes = body_so_far
            remaining = content_length - len(full_body_bytes)
            while remaining > 0:
                chunk = sock.recv(min(4096, remaining))
                if not chunk:
                    raise Exception('Connection closed before full body')
                full_body_bytes += chunk
                remaining -= len(chunk)
            download_ns = (time.perf_counter_ns() - receive_start_ns) - waiting_ns

        elif 'chunked' in transfer_encoding:
            # Decode chunked encoding
            full_body_bytes = b''
            remaining_data = body_so_far
            while True:
                while b'\r\n' not in remaining_data:
                    more = sock.recv(4096)
                    if not more:
                        raise Exception('Incomplete chunked response')
                    remaining_data += more
                line_end = remaining_data.index(b'\r\n')
                chunk_line = remaining_data[:line_end].decode('utf-8', errors='replace')
                remaining_data = remaining_data[line_end + 2:]
                chunk_size_str = chunk_line.split(';')[0].strip()
                chunk_size = int(chunk_size_str, 16)
                if chunk_size == 0:
                    break
                while len(remaining_data) < chunk_size + 2:
                    more = sock.recv(4096)
                    if not more:
                        raise Exception('Incomplete chunk data')
                    remaining_data += more
                full_body_bytes += remaining_data[:chunk_size]
                remaining_data = remaining_data[chunk_size + 2:]
            download_ns = (time.perf_counter_ns() - receive_start_ns) - waiting_ns

        else:
            # No Content-Length, no chunked → body is empty
            full_body_bytes = b''
            download_ns = 0

        # Clamp download_ns to non-negative
        if download_ns < 0:
            download_ns = 0

        # ---- Convert timings to ms (float, 4 decimals) ----
        timings = {
            'dns': round(dns_ns / 1_000_000, 4),
            'tcp': round(tcp_ns / 1_000_000, 4),
            'ssl': round(ssl_ns / 1_000_000, 4),
            'request_send': round(send_ns / 1_000_000, 4),
            'waiting': round(waiting_ns / 1_000_000, 4),
            'content_download': round(download_ns / 1_000_000, 4),
            'total': round((dns_ns + tcp_ns + ssl_ns + send_ns + waiting_ns + download_ns) / 1_000_000, 4)
        }

        # ---- Parse response body content ----
        content_type = resp_headers.get('Content-Type', '').lower()
        body_decoded = full_body_bytes.decode('utf-8', errors='replace')
        if 'application/json' in content_type and body_decoded:
            try:
                body_parsed = json.loads(body_decoded)
            except json.JSONDecodeError:
                body_parsed = body_decoded
        else:
            body_parsed = body_decoded if body_decoded else ''

        # Exact raw response size
        raw_size = len(headers_section) + 4 + len(full_body_bytes)

        return {
            'status': status_code,
            'status_text': status_text,
            'headers': resp_headers,
            'body': body_parsed,
            'response_time': timings['total'],
            'size': raw_size,
            'http_version': http_version,
            'timings': timings,
            'request': {
                'method': method.upper(),
                'url': url,
                'headers': headers,
                'body': body if body else None
            }
        }, None

    except Exception as e:
        return None, {'error': f'Request failed: {str(e)}'}
    finally:
        sock.close()


@method_decorator(csrf_exempt, name='dispatch')
class APIProxyView(View):
    async def post(self, request):
        try:
            data = JSONParser().parse(request)
            target_url = data['url']
            method = data['method'].lower()
            headers = data.get('headers', {})
            body_data = data.get('body', None)

            result, error = await asyncio.to_thread(
                make_request_sync, method, target_url, headers, body_data
            )
            if error:
                return JsonResponse(error, status=500)
            return JsonResponse(result)

        except Exception as e:
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)


@csrf_exempt
def api_proxy_fallback(request):
    if request.method == 'POST':
        try:
            data = JSONParser().parse(request)
            target_url = data['url']
            method = data['method'].lower()
            headers = data.get('headers', {})
            body_data = data.get('body', None)

            result, error = make_request_sync(method, target_url, headers, body_data)
            if error:
                return JsonResponse(error, status=500)
            return JsonResponse(result)

        except Exception as e:
            return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Only POST method is supported'}, status=405)