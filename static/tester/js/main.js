
document.addEventListener('DOMContentLoaded', function() {
    // Get CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    // DOM elements (existing + new)
    const sendBtn = document.getElementById('send-btn');
    const methodSelect = document.getElementById('method');
    const urlInput = document.getElementById('url');
    const requestBody = document.getElementById('request-body');
    const responseBody = document.getElementById('response-body');
    const responseHeaders = document.getElementById('response-headers');
    const addHeaderBtn = document.getElementById('add-header-btn');
    const addParamBtn = document.getElementById('add-param-btn');
    const headersContainer = document.getElementById('headers-container');
    const paramsContainer = document.getElementById('params-container');
    const tabs = document.querySelectorAll('[data-tab]');
    const tabContents = document.querySelectorAll('[data-tab-content]');

    let currentRequestAbortController = null;

    // Helpers (escapeHtml, getMethodColorClass, etc. – unchanged, included for completeness)
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    function getMethodColorClass(method) {
        const map = {
            'GET': 'text-green-600', 'POST': 'text-blue-600',
            'PUT': 'text-yellow-600', 'PATCH': 'text-purple-600',
            'DELETE': 'text-red-600', 'HEAD': 'text-gray-600',
            'OPTIONS': 'text-gray-600'
        };
        return map[method.toUpperCase()] || 'text-gray-800';
    }

    // Method select color
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            const map = {
                'GET': 'text-green-600', 'POST': 'text-blue-600',
                'PUT': 'text-yellow-600', 'PATCH': 'text-purple-600',
                'DELETE': 'text-red-600', 'HEAD': 'text-gray-600',
                'OPTIONS': 'text-gray-600'
            };
            for (const cls of Object.values(map)) methodSelect.classList.remove(cls);
            methodSelect.classList.add(map[this.value]);
        });
    }

    function collectHeaders() {
        const headers = {};
        document.querySelectorAll('.header-row').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                const key = inputs[0].value.trim();
                const value = inputs[1].value.trim();
                if (key && value) headers[key] = value;
            }
        });
        return headers;
    }

    function collectQueryParams() {
        const params = {};
        document.querySelectorAll('[data-param-row]').forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                const key = inputs[0].value.trim();
                const value = inputs[1].value.trim();
                if (key) params[key] = value;
            }
        });
        return params;
    }

    function buildUrlWithParams(baseUrl, params) {
        if (Object.keys(params).length === 0) return baseUrl;
        try {
            const url = new URL(baseUrl);
            Object.keys(params).forEach(key => {
                if (params[key]) url.searchParams.append(key, params[key]);
            });
            return url.toString();
        } catch (e) {
            return baseUrl;
        }
    }

    function isValidJson(jsonString) {
        if (!jsonString || jsonString.trim() === '') return true;
        try { JSON.parse(jsonString); return true; } catch (e) { return false; }
    }

    function formatJson(json) {
        if (typeof json !== 'string') json = JSON.stringify(json, null, 2);
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'number';
            if (/^"/.test(match)) cls = /:$/.test(match) ? 'key' : 'string';
            else if (/true|false/.test(match)) cls = 'boolean';
            else if (/null/.test(match)) cls = 'null';
            return `<span class="${cls}">${match}</span>`;
        });
        return json;
    }

    // Auth buttons (unchanged)
    document.getElementById('add-basic-auth')?.addEventListener('click', function() {
        const u = document.getElementById('basic-username')?.value;
        const p = document.getElementById('basic-password')?.value;
        if (u && p) {
            addHeader('Authorization', `Basic ${btoa(u + ':' + p)}`);
            document.getElementById('basic-username').value = '';
            document.getElementById('basic-password').value = '';
            document.querySelector('[data-tab="headers"]')?.click();
        } else alert('Enter username and password');
    });
    document.getElementById('add-bearer-auth')?.addEventListener('click', function() {
        const token = document.getElementById('bearer-token')?.value;
        if (token) {
            addHeader('Authorization', `Bearer ${token}`);
            document.getElementById('bearer-token').value = '';
            document.querySelector('[data-tab="headers"]')?.click();
        } else alert('Enter a token');
    });

    function addHeader(key, value) {
        const row = document.createElement('div');
        row.className = 'header-row grid grid-cols-12 gap-4 mb-3';
        row.innerHTML = `
            <div class="col-span-5"><input type="text" value="${key}" class="w-full p-2 border border-gray-300 rounded font-mono"></div>
            <div class="col-span-5"><input type="text" value="${value}" class="w-full p-2 border border-gray-300 rounded font-mono"></div>
            <div class="col-span-2"><button class="remove-header-btn text-red-500 hover:text-red-700 w-full py-2"><i class="fas fa-trash"></i></button></div>`;
        headersContainer?.appendChild(row);
        row.querySelector('.remove-header-btn')?.addEventListener('click', () => row.remove());
    }

    // Body format toggle
    document.querySelectorAll('.body-format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            document.querySelectorAll('.body-format-btn').forEach(b => {
                b.classList.remove('bg-blue-500', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-blue-500', 'text-white');
            const ta = document.getElementById('request-body');
            if (format === 'json') {
                ta.placeholder = '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com"\n}';
                try { if (ta.value.trim()) ta.value = JSON.stringify(JSON.parse(ta.value), null, 2); } catch (e) {}
            } else {
                ta.placeholder = 'Enter raw text content';
            }
        });
    });
    document.querySelector('[data-format="json"]')?.click();

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    }

    // Update Response UI (unchanged, but now also calls updateTiming)
    function updateResponseUI(data) {
        try {
            if (!data) return;
            const statusCode = document.getElementById('status-code');
            const statusText = document.getElementById('status-text');
            const statusIcon = document.querySelector('.fa-check-circle');
            if (data.status) {
                if (statusCode) statusCode.textContent = data.status;
                if (statusText) statusText.textContent = data.status_text || '';
                const cls = data.status >= 200 && data.status < 300 ? 'text-green-600' :
                           data.status >= 400 ? 'text-red-600' : 'text-yellow-600';
                const iconCls = data.status >= 200 && data.status < 300 ? 'fa-check-circle text-green-500' :
                                data.status >= 400 ? 'fa-exclamation-circle text-red-500' : 'fa-info-circle text-yellow-500';
                if (statusCode) statusCode.className = `text-2xl font-bold ${cls}`;
                if (statusIcon) statusIcon.className = `fas ${iconCls}`;
            }
            if (data.response_time) {
                const el = document.getElementById('response-time');
                if (el) el.textContent = data.response_time;
            }
            if (data.size !== undefined) {
                const sizeEl = document.getElementById('response-size');
                const unitEl = document.getElementById('size-unit');
                if (sizeEl && unitEl) {
                    const formatted = formatBytes(data.size);
                    const [size, unit] = formatted.split(' ');
                    sizeEl.textContent = size;
                    unitEl.textContent = unit;
                }
            }
            if (data.http_version) {
                const [protocol, version] = data.http_version.split('/');
                const protEl = document.getElementById('response-protocol');
                const verEl = document.getElementById('protocol-version');
                if (protEl) protEl.textContent = protocol;
                if (verEl) verEl.textContent = `/${version}`;
            }
            const respHeadersTbody = document.getElementById('response-headers');
            if (respHeadersTbody) {
                if (data.headers && Object.keys(data.headers).length > 0) {
                    let html = '';
                    for (const [key, value] of Object.entries(data.headers)) {
                        html += `<tr class="hover:bg-gray-50">
                            <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-800">${escapeHtml(key)}</td>
                            <td class="px-4 py-3 text-sm font-mono text-gray-800">${escapeHtml(value)}</td>
                        </tr>`;
                    }
                    respHeadersTbody.innerHTML = html;
                } else {
                    respHeadersTbody.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">No headers received</td></tr>';
                }
            }
            const respBody = document.getElementById('response-body');
            if (respBody) {
                if (data.body) {
                    respBody.innerHTML = typeof data.body === 'object' ? formatJson(data.body) : escapeHtml(data.body);
                } else if (data.error) {
                    respBody.innerHTML = `<span class="text-red-600">${escapeHtml(data.error)}</span>`;
                    if (data.raw_response) respBody.innerHTML += `<pre class="mt-2 text-xs">${escapeHtml(data.raw_response)}</pre>`;
                } else {
                    respBody.textContent = 'No response body received';
                }
            }
        } catch (err) {
            console.error('Error updating response UI:', err);
        }
    }

    function resetResponseUI() {
        const ids = ['status-code','status-text','response-time','response-size','size-unit','response-protocol','protocol-version'];
        ids.forEach(id => { const el = document.getElementById(id); if (el) el.textContent = id.includes('time') ? '-' : ''; });
        const respHeadersTbody = document.getElementById('response-headers');
        if (respHeadersTbody) respHeadersTbody.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">No headers received yet</td></tr>';
        const respBody = document.getElementById('response-body');
        if (respBody) respBody.textContent = 'Send a request to see response body';
    }

    // Update Request Details (unchanged)
    function updateRequestDetails(data) {
        const section = document.getElementById('request-details-section');
        if (!section) return;
        if (!data || !data.request) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');
        const req = data.request;
        const methodEl = document.getElementById('req-method');
        if (methodEl) {
            methodEl.textContent = req.method || '-';
            methodEl.className = `text-2xl font-bold ${getMethodColorClass(req.method)}`;
        }
        const urlEl = document.getElementById('req-url');
        if (urlEl) urlEl.textContent = req.url || '-';
        const headersTbody = document.getElementById('request-headers-tbody');
        if (headersTbody) {
            if (req.headers && Object.keys(req.headers).length > 0) {
                let rows = '';
                for (const [key, value] of Object.entries(req.headers)) {
                    rows += `<tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-800">${escapeHtml(key)}</td>
                        <td class="px-4 py-3 text-sm font-mono text-gray-800 break-all">${escapeHtml(value)}</td>
                    </tr>`;
                }
                headersTbody.innerHTML = rows;
            } else {
                headersTbody.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">No headers sent</td></tr>';
            }
        }
        const bodyDisplay = document.getElementById('request-body-display');
        if (bodyDisplay) {
            if (req.body) {
                try {
                    const parsed = JSON.parse(req.body);
                    bodyDisplay.textContent = JSON.stringify(parsed, null, 2);
                } catch (e) {
                    bodyDisplay.textContent = req.body;
                }
            } else {
                bodyDisplay.textContent = '(empty)';
            }
        }
    }

    // ===== NEW: Update Timing Analysis =====
    function updateTiming(data) {
        const section = document.getElementById('timing-section');
        if (!section) return;
        if (!data || !data.timings) {
            section.classList.add('hidden');
            return;
        }
        section.classList.remove('hidden');

        const t = data.timings;

        // Format with 4 decimal places
        document.getElementById('time-dns').textContent      = t.dns.toFixed(4) + ' ms';
        document.getElementById('time-tcp').textContent      = t.tcp.toFixed(4) + ' ms';
        document.getElementById('time-ssl').textContent      = t.ssl.toFixed(4) + ' ms';
        document.getElementById('time-send').textContent     = t.request_send.toFixed(4) + ' ms';
        document.getElementById('time-waiting').textContent  = t.waiting.toFixed(4) + ' ms';
        document.getElementById('time-download').textContent = t.content_download.toFixed(4) + ' ms';
        document.getElementById('total-time-label').textContent = t.total.toFixed(4) + ' ms';

        // Build the visual bar
        const bar = document.getElementById('timing-bar');
        if (!bar) return;
        bar.innerHTML = '';

        const total = t.total || 1;
        const phases = [
            { label: 'DNS', time: t.dns, color: 'bg-blue-400' },
            { label: 'TCP', time: t.tcp, color: 'bg-green-400' },
            { label: 'SSL', time: t.ssl, color: 'bg-purple-400' },
            { label: 'Send', time: t.request_send, color: 'bg-yellow-400' },
            { label: 'Wait', time: t.waiting, color: 'bg-orange-400' },
            { label: 'Download', time: t.content_download, color: 'bg-red-400' }
        ];

        phases.forEach(phase => {
            if (phase.time > 0) {
                const width = (phase.time / total) * 100;
                const segment = document.createElement('div');
                segment.className = `${phase.color} h-full`;
                segment.style.width = width + '%';
                segment.title = `${phase.label}: ${phase.time} ms`;
                bar.appendChild(segment);
            }
        });
    }

    // Tab switching (unchanged)
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            tabs.forEach(t => { t.classList.remove('tab-active', 'text-gray-900'); t.classList.add('text-gray-600'); });
            this.classList.add('tab-active', 'text-gray-900');
            this.classList.remove('text-gray-600');
            tabContents.forEach(c => c.classList.add('hidden'));
            const target = document.querySelector(`[data-tab-content="${tabName}"]`);
            if (target) target.classList.remove('hidden');
        });
    });

    // Add header/param rows (unchanged)
    if (addHeaderBtn) {
        addHeaderBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'header-row grid grid-cols-12 gap-4 mb-3';
            row.innerHTML = `
                <div class="col-span-5"><input type="text" placeholder="Key" class="w-full p-2 border border-gray-300 rounded font-mono"></div>
                <div class="col-span-5"><input type="text" placeholder="Value" class="w-full p-2 border border-gray-300 rounded font-mono"></div>
                <div class="col-span-2"><button class="remove-header-btn text-red-500 hover:text-red-700 w-full py-2"><i class="fas fa-trash"></i></button></div>`;
            headersContainer?.appendChild(row);
            row.querySelector('.remove-header-btn')?.addEventListener('click', () => row.remove());
        });
    }
    if (addParamBtn) {
        addParamBtn.addEventListener('click', () => {
            const row = document.createElement('div');
            row.className = 'grid grid-cols-12 gap-4 mb-3';
            row.setAttribute('data-param-row', '');
            row.innerHTML = `
                <div class="col-span-5"><input type="text" placeholder="parameter_name" class="w-full p-2 border border-gray-300 rounded"></div>
                <div class="col-span-5"><input type="text" placeholder="value" class="w-full p-2 border border-gray-300 rounded"></div>
                <div class="col-span-2"><button class="remove-param-btn text-red-500 hover:text-red-700 w-full py-2"><i class="fas fa-trash"></i></button></div>`;
            paramsContainer?.appendChild(row);
            row.querySelector('.remove-param-btn')?.addEventListener('click', () => row.remove());
        });
    }

    document.querySelectorAll('.remove-header-btn').forEach(btn => {
        btn.addEventListener('click', function() { this.closest('.header-row')?.remove(); });
    });
    document.querySelectorAll('.remove-param-btn').forEach(btn => {
        btn.addEventListener('click', function() { this.closest('[data-param-row]')?.remove(); });
    });

    // Send button handler (updated to call updateTiming)
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            if (currentRequestAbortController) currentRequestAbortController.abort();
            currentRequestAbortController = new AbortController();
            const signal = currentRequestAbortController.signal;

            const method = methodSelect?.value || 'GET';
            let url = urlInput?.value || '';
            const headers = collectHeaders();
            const params = collectQueryParams();
            let body = method !== 'GET' && method !== 'HEAD' ? requestBody?.value : null;

            if (!url) { alert('Please enter a URL'); return; }
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
                if (urlInput) urlInput.value = url;
            }
            if (body && body.trim() !== '') {
                if (!isValidJson(body)) { alert('Request body is not valid JSON'); return; }
                try { body = JSON.parse(body); } catch (e) {
                    alert('Invalid JSON');
                    sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send';
                    sendBtn.disabled = false;
                    return;
                }
            } else body = null;

            url = buildUrlWithParams(url, params);

            // Hide sections initially
            ['request-details-section', 'timing-section'].forEach(id => {
                const sec = document.getElementById(id);
                if (sec) sec.classList.add('hidden');
            });

            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
            sendBtn.disabled = true;

            resetResponseUI();
            if (responseBody) responseBody.textContent = 'Loading...';
            if (responseHeaders) responseHeaders.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">Loading headers...</td></tr>';

            const requestData = { url, method, headers };
            if (body) requestData.body = body;

            fetch('/api/proxy/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrftoken },
                body: JSON.stringify(requestData),
                signal: signal
            })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                updateResponseUI(data);
                updateRequestDetails(data);
                updateTiming(data);          // <--- show timing analysis
            })
            .catch(error => {
                console.error('Fetch error:', error);
                if (error.name === 'AbortError') {
                    if (responseBody) responseBody.textContent = 'Request was cancelled';
                } else {
                    if (responseBody) responseBody.innerHTML = `<span class="text-red-600">Error: ${escapeHtml(error.message)}</span>`;
                }
                ['request-details-section', 'timing-section'].forEach(id => {
                    const sec = document.getElementById(id);
                    if (sec) sec.classList.add('hidden');
                });
            })
            .finally(() => {
                sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send';
                sendBtn.disabled = false;
                currentRequestAbortController = null;
            });
        });
    }

    // Close buttons for new section
    document.getElementById('hide-timing')?.addEventListener('click', () => {
        document.getElementById('timing-section')?.classList.add('hidden');
    });
    document.getElementById('hide-request-details')?.addEventListener('click', () => {
        document.getElementById('request-details-section')?.classList.add('hidden');
    });

    // Initialize method color
    if (methodSelect) methodSelect.dispatchEvent(new Event('change'));
    resetResponseUI();
});