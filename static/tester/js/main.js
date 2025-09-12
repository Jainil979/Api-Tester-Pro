// document.addEventListener('DOMContentLoaded', function() {
    
    
//     // Get CSRF token for Django
//     function getCookie(name) {
//         let cookieValue = null;
//         if (document.cookie && document.cookie !== '') {
//             const cookies = document.cookie.split(';');
//             for (let i = 0; i < cookies.length; i++) {
//                 const cookie = cookies[i].trim();
//                 if (cookie.substring(0, name.length + 1) === (name + '=')) {
//                     cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//                     break;
//                 }
//             }
//         }
//         return cookieValue;
//     }
//     const csrftoken = getCookie('csrftoken');



//     // DOM Elements
//     const sendBtn = document.getElementById('send-btn');
//     const methodSelect = document.getElementById('method');
//     const urlInput = document.getElementById('url');
//     const requestBody = document.getElementById('request-body');
//     const statusElement = document.getElementById('status');
//     // const timeElement = document.getElementById('time');
//     // const sizeElement = document.getElementById('size');
//     const responseBody = document.getElementById('response-body');
//     const responseHeaders = document.getElementById('response-headers');
//     const addHeaderBtn = document.getElementById('add-header-btn');
//     const addParamBtn = document.getElementById('add-param-btn');
//     const headersContainer = document.getElementById('headers-container');
//     const paramsContainer = document.getElementById('params-container');
//     const tabs = document.querySelectorAll('[data-tab]');
//     const tabContents = document.querySelectorAll('[data-tab-content]');



//     // Update method select colors based on selection
//     methodSelect.addEventListener('change', function() {
//         const colorMap = {
//             'GET': 'text-green-600',
//             'POST': 'text-blue-600',
//             'PUT': 'text-yellow-600',
//             'PATCH': 'text-purple-600',
//             'DELETE': 'text-red-600',
//             'HEAD': 'text-gray-600',
//             'OPTIONS': 'text-gray-600'
//         };
        
//         // Remove all color classes
//         for (const cls of Object.values(colorMap)) {
//             methodSelect.classList.remove(cls);
//         }
        
//         // Add the appropriate color class
//         methodSelect.classList.add(colorMap[this.value]);
        
//         // Show/hide request body based on method
//         // toggleRequestBodyVisibility();
//     });




//     // Toggle request body visibility based on HTTP method
//     // function toggleRequestBodyVisibility() {
//     //     const bodySection = document.querySelector('[data-body-section]');
//     //     const methodsWithBody = ['POST', 'PUT', 'PATCH'];
        
//     //     if (methodsWithBody.includes(methodSelect.value)) {
//     //         bodySection.classList.remove('hidden');
//     //     } else {
//     //         bodySection.classList.add('hidden');
//     //     }
//     // }



//     // Collect headers from the UI
//     function collectHeaders() {
//         const headers = {};
//         const headerRows = document.querySelectorAll('.header-row');
        
//         headerRows.forEach(row => {
//             const keyInput = row.querySelector('input');
//             const valueInput = row.querySelectorAll('input')[1];
            
//             if (keyInput && valueInput && keyInput.value && valueInput.value) {
//                 headers[keyInput.value] = valueInput.value;
//             }
//         });
        
//         return headers;
//     }



//     // Collect query parameters from the UI
//     function collectQueryParams() {
//         const params = {};
//         const paramRows = document.querySelectorAll('[data-param-row]');
        
//         paramRows.forEach(row => {
//             const keyInput = row.querySelector('input');
//             const valueInput = row.querySelectorAll('input')[1];
            
//             if (keyInput && valueInput && keyInput.value) {
//                 params[keyInput.value] = valueInput.value;
//             }
//         });
        
//         return params;
//     }



//     // Build URL with query parameters
//     function buildUrlWithParams(baseUrl, params) {
//         if (Object.keys(params).length === 0) return baseUrl;
        
//         const url = new URL(baseUrl);
//         Object.keys(params).forEach(key => {
//             if (params[key]) {
//                 url.searchParams.append(key, params[key]);
//             }
//         });
        
//         return url.toString();
//     }



//     // Validate JSON
//     function isValidJson(jsonString) {
//         try {
//             JSON.parse(jsonString);
//             return true;
//         } catch (e) {
//             return false;
//         }
//     }



//     // Format JSON response with syntax highlighting
//     function formatJson(json) {
//         if (typeof json !== 'string') {
//             json = JSON.stringify(json, null, 2);
//         }
        
//         // Escape HTML tags
//         json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
//         // Add syntax highlighting
//         json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
//             let cls = 'number';
//             if (/^"/.test(match)) {
//                 if (/:$/.test(match)) {
//                     cls = 'key';
//                 } else {
//                     cls = 'string';
//                 }
//             } else if (/true|false/.test(match)) {
//                 cls = 'boolean';
//             } else if (/null/.test(match)) {
//                 cls = 'null';
//             }
//             return '<span class="' + cls + '">' + match + '</span>';
//         });
        
//         return json;
//     }



//     // Add authentication handlers
//     document.getElementById('add-basic-auth').addEventListener('click', function() {
//         const username = document.getElementById('basic-username').value;
//         const password = document.getElementById('basic-password').value;
        
//         if (username && password) {
//             const encoded = btoa(`${username}:${password}`);
//             addHeader('Authorization', `Basic ${encoded}`);
            
//             // Clear the inputs
//             document.getElementById('basic-username').value = '';
//             document.getElementById('basic-password').value = '';
            
//             // Switch to headers tab to see the added header
//             document.querySelector('[data-tab="headers"]').click();
//         } else {
//             alert('Please enter both username and password for Basic Auth');
//         }
//     });

//     document.getElementById('add-bearer-auth').addEventListener('click', function() {
//         const token = document.getElementById('bearer-token').value;
        
//         if (token) {
//             addHeader('Authorization', `Bearer ${token}`);
            
//             // Clear the input
//             document.getElementById('bearer-token').value = '';
            
//             // Switch to headers tab to see the added header
//             document.querySelector('[data-tab="headers"]').click();
//         } else {
//             alert('Please enter a token for Bearer Auth');
//         }
//     });




//     // Helper function to add headers to the headers container
//     function addHeader(key, value) {
//         const headersContainer = document.getElementById('headers-container');
//         const newRow = document.createElement('div');
//         newRow.className = 'header-row grid grid-cols-12 gap-4 mb-3';
//         newRow.innerHTML = `
//             <div class="col-span-5">
//                 <input type="text" value="${key}" class="w-full p-2 border border-gray-300 rounded font-mono">
//             </div>
//             <div class="col-span-5">
//                 <input type="text" value="${value}" class="w-full p-2 border border-gray-300 rounded font-mono">
//             </div>
//             <div class="col-span-2">
//                 <button class="remove-header-btn text-red-500 hover:text-red-700 w-full py-2">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//         `;
//         headersContainer.appendChild(newRow);
        
//         // Add event listener to the remove button
//         newRow.querySelector('.remove-header-btn').addEventListener('click', function() {
//             newRow.remove();
//         });
//     }



//     // Body format toggle functionality
//     document.querySelectorAll('.body-format-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//             const format = this.getAttribute('data-format');
            
//             // Update button styles
//             document.querySelectorAll('.body-format-btn').forEach(b => {
//                 b.classList.remove('bg-blue-500', 'text-white');
//                 b.classList.add('bg-gray-200', 'text-gray-700');
//             });
//             this.classList.remove('bg-gray-200', 'text-gray-700');
//             this.classList.add('bg-blue-500', 'text-white');
            
//             // Update placeholder based on format
//             const bodyTextarea = document.getElementById('request-body');
//             if (format === 'json') {
//                 bodyTextarea.placeholder = '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com"\n}';
                
//                 // If textarea is empty, show the placeholder
//                 if (!bodyTextarea.value.trim()) {
//                     bodyTextarea.setAttribute('data-empty', 'true');
//                 }
                
//                 // Try to format existing content as JSON if it's not empty
//                 try {
//                     if (bodyTextarea.value.trim()) {
//                         const parsed = JSON.parse(bodyTextarea.value);
//                         bodyTextarea.value = JSON.stringify(parsed, null, 2);
//                     }
//                 } catch (e) {
//                     // If not valid JSON, keep as is
//                 }
//             } else {
//                 bodyTextarea.placeholder = 'Enter raw text content';
                
//                 // If textarea is empty, show the placeholder
//                 if (!bodyTextarea.value.trim()) {
//                     bodyTextarea.setAttribute('data-empty', 'true');
//                 }
//             }
//         });
//     });



//     // Initialize body format to JSON and ensure placeholder is visible
//     function initializeBodySection() {
//         const bodyTextarea = document.getElementById('request-body');
        
//         // Set textarea to empty and show placeholder
//         bodyTextarea.value = '';
//         bodyTextarea.setAttribute('data-empty', 'true');
        
//         // Trigger JSON format selection
//         document.querySelector('[data-format="json"]').click();
//     }



//     // Call initialization when DOM is loaded
//     document.addEventListener('DOMContentLoaded', function() {
//         // Your existing DOMContentLoaded code...
        
//         // Initialize body section
//         initializeBodySection();
        
//         // Add event listener to track when user types
//         const bodyTextarea = document.getElementById('request-body');
//         bodyTextarea.addEventListener('input', function() {
//             if (this.value.trim()) {
//                 this.removeAttribute('data-empty');
//             } else {
//                 this.setAttribute('data-empty', 'true');
//             }
//         });
//     });




//     // Update the send button event handler
//     sendBtn.addEventListener('click', function() {
//         const method = methodSelect.value;
//         let url = urlInput.value;
//         const headers = collectHeaders();
//         const params = collectQueryParams();
//         let body = method !== 'GET' && method !== 'HEAD' ? requestBody.value : null;
        
//         // Validate URL
//         if (!url) {
//             alert('Please enter a URL');
//             return;
//         }
        
//         // Add http:// if no protocol specified
//         if (!url.startsWith('http://') && !url.startsWith('https://')) {
//             url = 'https://' + url;
//             urlInput.value = url;
//         }
        
//         // Validate JSON body only if it exists and is not empty
//         if (body && body.trim() !== '') {
//             if (!isValidJson(body)) {
//                 alert('Request body is not valid JSON');
//                 return;
//             }
            
//             try {
//                 // Parse the JSON to ensure it's valid
//                 body = JSON.parse(body);
//             } catch (e) {
//                 alert('Invalid JSON in request body');
//                 sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send';
//                 sendBtn.disabled = false;
//                 return;
//             }
//         } else {
//             // If body is empty or only whitespace, set it to null
//             body = null;
//         }
        
//         // Add query parameters to URL
//         url = buildUrlWithParams(url, params);
        
//         // Show loading state
//         sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
//         sendBtn.disabled = true;
//         // statusElement.textContent = '';
//         // timeElement.textContent = '';
//         responseBody.textContent = 'Loading...';
//         responseHeaders.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">Loading headers...</td></tr>';
        
//         // Prepare request data
//         const requestData = {
//             url: url,
//             method: method,
//             headers: headers
//         };
        
//         // Add body if applicable
//         if (body) {
//             requestData.body = body;
//         }
        
//         // Make request to our Django proxy
//         fetch('/api/proxy/', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'X-CSRFToken': csrftoken
//             },
//             body: JSON.stringify(requestData)
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Update UI with response
//             updateResponseUI(data);
//         })
//         .catch(error => {
//             // Handle errors
//             console.error('Error:', error);
//             statusElement.textContent = 'Error: ' + error.message;
//             statusElement.className = 'px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium';
//         })
//         .finally(() => {
//             // Reset button state
//             sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send';
//             sendBtn.disabled = false;
//         });
//     });






//     // Format bytes to human-readable format
//     function formatBytes(bytes, decimals = 2) {
//         if (bytes === 0) return '0 Bytes';
        
//         const k = 1024;
//         const dm = decimals < 0 ? 0 : decimals;
//         const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
//         const i = Math.floor(Math.log(bytes) / Math.log(k));
        
//         return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
//     }




//     // Update UI with response data
//     function updateResponseUI(data) {
//         // Update status code and text
//         if (data.status) {
//             const statusCode = document.getElementById('status-code');
//             const statusText = document.getElementById('status-text');
//             const statusIcon = document.querySelector('.fa-check-circle');
            
//             statusCode.textContent = data.status;
            
//             // Set status text based on code
//             const statusMessages = {
//                 200: 'OK',
//                 201: 'Created',
//                 204: 'No Content',
//                 400: 'Bad Request',
//                 401: 'Unauthorized',
//                 403: 'Forbidden',
//                 404: 'Not Found',
//                 500: 'Internal Server Error'
//             };
            
//             statusText.textContent = statusMessages[data.status] || '';
            
//             // Set status color based on code range
//             if (data.status >= 200 && data.status < 300) {
//                 statusCode.className = 'text-2xl font-bold text-green-600';
//                 statusIcon.className = 'fas fa-check-circle text-green-500';
//             } else if (data.status >= 400) {
//                 statusCode.className = 'text-2xl font-bold text-red-600';
//                 statusIcon.className = 'fas fa-exclamation-circle text-red-500';
//             } else {
//                 statusCode.className = 'text-2xl font-bold text-yellow-600';
//                 statusIcon.className = 'fas fa-info-circle text-yellow-500';
//             }
//         }
        
//         // Update response time
//         if (data.response_time) {
//             document.getElementById('response-time').textContent = data.response_time;
//         }
        
//         // Update response size with proper formatting
//         if (data.size !== undefined) {
//             const sizeElement = document.getElementById('response-size');
//             const sizeUnitElement = document.getElementById('size-unit');
//             const formatted = formatBytes(data.size);
//             const [size, unit] = formatted.split(' ');
            
//             sizeElement.textContent = size;
//             sizeUnitElement.textContent = unit;
//         }
        
//         // Update HTTP version (you'll need to extract this from response headers)
//         if (data.headers && data.headers['content-length']) {
//             // Try to determine HTTP version from headers or other indicators
//             // For now, we'll assume HTTP/1.1 as it's most common
//             document.getElementById('protocol-version').textContent = '/1.1';
//         }
        
//         // Update response headers
//         if (data.headers && Object.keys(data.headers).length > 0) {
//             let headersHtml = '';
//             for (const [key, value] of Object.entries(data.headers)) {
//                 headersHtml += `
//                     <tr class="hover:bg-gray-50">
//                         <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-800">${key}</td>
//                         <td class="px-4 py-3 text-sm font-mono text-gray-800">${value}</td>
//                     </tr>
//                 `;
//             }
//             responseHeaders.innerHTML = headersHtml;
//         } else {
//             responseHeaders.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">No headers received</td></tr>';
//         }
        
//         // Update response body
//         if (data.body) {
//             if (typeof data.body === 'object') {
//                 responseBody.innerHTML = formatJson(data.body);
//             } else {
//                 // Handle non-JSON responses (text, HTML, etc.)
//                 responseBody.textContent = data.body;
//             }
//         } else if (data.error) {
//             responseBody.innerHTML = `<span class="text-red-600">${data.error}</span>`;
//         } else {
//             responseBody.textContent = 'No response body received';
//         }
//     }




//     // Tab switching functionality
//     tabs.forEach(tab => {
//         tab.addEventListener('click', function() {
//             const tabName = this.getAttribute('data-tab');
            
//             // Remove active class from all tabs
//             tabs.forEach(t => {
//                 t.classList.remove('tab-active', 'text-gray-900');
//                 t.classList.add('text-gray-600');
//             });
            
//             // Add active class to clicked tab
//             this.classList.add('tab-active', 'text-gray-900');
//             this.classList.remove('text-gray-600');
            
//             // Show the corresponding content
//             tabContents.forEach(content => {
//                 content.classList.add('hidden');
//             });
//             document.querySelector(`[data-tab-content="${tabName}"]`).classList.remove('hidden');
//         });
//     });

//     // Add new header row
//     addHeaderBtn.addEventListener('click', function() {
//         const newRow = document.createElement('div');
//         newRow.className = 'header-row grid grid-cols-12 gap-4 mb-3';
//         newRow.innerHTML = `
//             <div class="col-span-5">
//                 <input type="text" placeholder="Key" class="w-full p-2 border border-gray-300 rounded font-mono">
//             </div>
//             <div class="col-span-5">
//                 <input type="text" placeholder="Value" class="w-full p-2 border border-gray-300 rounded font-mono">
//             </div>
//             <div class="col-span-2">
//                 <button class="remove-header-btn text-red-500 hover:text-red-700 w-full py-2">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//         `;
//         headersContainer.appendChild(newRow);
        
//         // Add event listener to the remove button
//         newRow.querySelector('.remove-header-btn').addEventListener('click', function() {
//             newRow.remove();
//         });
//     });

//     // Add new parameter row
//     addParamBtn.addEventListener('click', function() {
//         const newRow = document.createElement('div');
//         newRow.className = 'grid grid-cols-12 gap-4 mb-3';
//         newRow.setAttribute('data-param-row', '');
//         newRow.innerHTML = `
//             <div class="col-span-5">
//                 <input type="text" placeholder="parameter_name" class="w-full p-2 border border-gray-300 rounded">
//             </div>
//             <div class="col-span-5">
//                 <input type="text" placeholder="value" class="w-full p-2 border border-gray-300 rounded">
//             </div>
//             <div class="col-span-2">
//                 <button class="remove-param-btn text-red-500 hover:text-red-700 w-full py-2">
//                     <i class="fas fa-trash"></i>
//                 </button>
//             </div>
//         `;
//         paramsContainer.appendChild(newRow);
        
//         // Add event listener to the remove button
//         newRow.querySelector('.remove-param-btn').addEventListener('click', function() {
//             newRow.remove();
//         });
//     });

//     // Add event listeners to existing remove buttons
//     document.querySelectorAll('.remove-header-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//             this.closest('.header-row').remove();
//         });
//     });

//     document.querySelectorAll('.remove-param-btn').forEach(btn => {
//         btn.addEventListener('click', function() {
//             this.closest('[data-param-row]').remove();
//         });
//     });

//     // Initialize with correct method color and body visibility
//     methodSelect.dispatchEvent(new Event('change'));
// });











document.addEventListener('DOMContentLoaded', function() {
    // Get CSRF token for Django
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

    // DOM Elements
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

    // State management
    let currentRequestAbortController = null;

    // Update method select colors based on selection
    methodSelect.addEventListener('change', function() {
        const colorMap = {
            'GET': 'text-green-600',
            'POST': 'text-blue-600',
            'PUT': 'text-yellow-600',
            'PATCH': 'text-purple-600',
            'DELETE': 'text-red-600',
            'HEAD': 'text-gray-600',
            'OPTIONS': 'text-gray-600'
        };
        
        // Remove all color classes
        for (const cls of Object.values(colorMap)) {
            methodSelect.classList.remove(cls);
        }
        
        // Add the appropriate color class
        methodSelect.classList.add(colorMap[this.value]);
    });

    // Collect headers from the UI
    function collectHeaders() {
        const headers = {};
        const headerRows = document.querySelectorAll('.header-row');
        
        headerRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                const key = inputs[0].value.trim();
                const value = inputs[1].value.trim();
                
                if (key && value) {
                    headers[key] = value;
                }
            }
        });
        
        return headers;
    }

    // Collect query parameters from the UI
    function collectQueryParams() {
        const params = {};
        const paramRows = document.querySelectorAll('[data-param-row]');
        
        paramRows.forEach(row => {
            const inputs = row.querySelectorAll('input');
            if (inputs.length >= 2) {
                const key = inputs[0].value.trim();
                const value = inputs[1].value.trim();
                
                if (key) {
                    params[key] = value;
                }
            }
        });
        
        return params;
    }

    // Build URL with query parameters
    function buildUrlWithParams(baseUrl, params) {
        if (Object.keys(params).length === 0) return baseUrl;
        
        try {
            const url = new URL(baseUrl);
            Object.keys(params).forEach(key => {
                if (params[key]) {
                    url.searchParams.append(key, params[key]);
                }
            });
            return url.toString();
        } catch (e) {
            console.error('Invalid URL:', e);
            return baseUrl;
        }
    }

    // Validate JSON
    function isValidJson(jsonString) {
        if (!jsonString || jsonString.trim() === '') return true;
        
        try {
            JSON.parse(jsonString);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Format JSON response with syntax highlighting
    function formatJson(json) {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }
        
        // Escape HTML tags
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Add syntax highlighting
        json = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
            let cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
        
        return json;
    }

    // Add authentication handlers
    document.getElementById('add-basic-auth').addEventListener('click', function() {
        const username = document.getElementById('basic-username').value;
        const password = document.getElementById('basic-password').value;
        
        if (username && password) {
            const encoded = btoa(`${username}:${password}`);
            addHeader('Authorization', `Basic ${encoded}`);
            
            // Clear the inputs
            document.getElementById('basic-username').value = '';
            document.getElementById('basic-password').value = '';
            
            // Switch to headers tab to see the added header
            document.querySelector('[data-tab="headers"]').click();
        } else {
            alert('Please enter both username and password for Basic Auth');
        }
    });

    document.getElementById('add-bearer-auth').addEventListener('click', function() {
        const token = document.getElementById('bearer-token').value;
        
        if (token) {
            addHeader('Authorization', `Bearer ${token}`);
            
            // Clear the input
            document.getElementById('bearer-token').value = '';
            
            // Switch to headers tab to see the added header
            document.querySelector('[data-tab="headers"]').click();
        } else {
            alert('Please enter a token for Bearer Auth');
        }
    });

    // Helper function to add headers to the headers container
    function addHeader(key, value) {
        const newRow = document.createElement('div');
        newRow.className = 'header-row grid grid-cols-12 gap-4 mb-3';
        newRow.innerHTML = `
            <div class="col-span-5">
                <input type="text" value="${key}" class="w-full p-2 border border-gray-300 rounded font-mono">
            </div>
            <div class="col-span-5">
                <input type="text" value="${value}" class="w-full p-2 border border-gray-300 rounded font-mono">
            </div>
            <div class="col-span-2">
                <button class="remove-header-btn text-red-500 hover:text-red-700 w-full py-2">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        headersContainer.appendChild(newRow);
        
        // Add event listener to the remove button
        newRow.querySelector('.remove-header-btn').addEventListener('click', function() {
            newRow.remove();
        });
    }

    // Body format toggle functionality
    document.querySelectorAll('.body-format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            
            // Update button styles
            document.querySelectorAll('.body-format-btn').forEach(b => {
                b.classList.remove('bg-blue-500', 'text-white');
                b.classList.add('bg-gray-200', 'text-gray-700');
            });
            this.classList.remove('bg-gray-200', 'text-gray-700');
            this.classList.add('bg-blue-500', 'text-white');
            
            // Update placeholder based on format
            const bodyTextarea = document.getElementById('request-body');
            if (format === 'json') {
                bodyTextarea.placeholder = '{\n  "id": 1,\n  "name": "John Doe",\n  "email": "john@example.com"\n}';
                
                // Try to format existing content as JSON if it's not empty
                try {
                    if (bodyTextarea.value.trim()) {
                        const parsed = JSON.parse(bodyTextarea.value);
                        bodyTextarea.value = JSON.stringify(parsed, null, 2);
                    }
                } catch (e) {
                    // If not valid JSON, keep as is
                }
            } else {
                bodyTextarea.placeholder = 'Enter raw text content';
            }
        });
    });

    // Initialize body format to JSON
    document.querySelector('[data-format="json"]').click();

    // Format bytes to human-readable format
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    // Update UI with response data
    function updateResponseUI(data) {
        // Update status code and text
        if (data.status) {
            const statusCode = document.getElementById('status-code');
            const statusText = document.getElementById('status-text');
            const statusIcon = document.querySelector('.fa-check-circle');
            
            statusCode.textContent = data.status;
            statusText.textContent = data.status_text || '';
            
            // Set status color based on code range
            if (data.status >= 200 && data.status < 300) {
                statusCode.className = 'text-2xl font-bold text-green-600';
                if (statusIcon) statusIcon.className = 'fas fa-check-circle text-green-500';
            } else if (data.status >= 400) {
                statusCode.className = 'text-2xl font-bold text-red-600';
                if (statusIcon) statusIcon.className = 'fas fa-exclamation-circle text-red-500';
            } else {
                statusCode.className = 'text-2xl font-bold text-yellow-600';
                if (statusIcon) statusIcon.className = 'fas fa-info-circle text-yellow-500';
            }
        }
        
        // Update response time
        if (data.response_time) {
            document.getElementById('response-time').textContent = data.response_time;
        }
        
        // Update response size with proper formatting
        if (data.size !== undefined) {
            const sizeElement = document.getElementById('response-size');
            const sizeUnitElement = document.getElementById('size-unit');
            const formatted = formatBytes(data.size);
            const [size, unit] = formatted.split(' ');
            
            sizeElement.textContent = size;
            sizeUnitElement.textContent = unit;
        }
        
        // Update HTTP version
        if (data.http_version) {
            const [protocol, version] = data.http_version.split('/');
            document.getElementById('response-protocol').textContent = protocol;
            document.getElementById('protocol-version').textContent = `/${version}`;
        }
        
        // Update response headers
        if (data.headers && Object.keys(data.headers).length > 0) {
            let headersHtml = '';
            for (const [key, value] of Object.entries(data.headers)) {
                headersHtml += `
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-800">${key}</td>
                        <td class="px-4 py-3 text-sm font-mono text-gray-800">${value}</td>
                    </tr>
                `;
            }
            responseHeaders.innerHTML = headersHtml;
        } else {
            responseHeaders.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">No headers received</td></tr>';
        }
        
        // Update response body
        if (data.body) {
            if (typeof data.body === 'object') {
                responseBody.innerHTML = formatJson(data.body);
            } else {
                // Handle non-JSON responses (text, HTML, etc.)
                responseBody.textContent = data.body;
            }
        } else if (data.error) {
            responseBody.innerHTML = `<span class="text-red-600">${data.error}</span>`;
            if (data.raw_response) {
                responseBody.innerHTML += `<pre class="mt-2 text-xs">${data.raw_response}</pre>`;
            }
        } else {
            responseBody.textContent = 'No response body received';
        }
    }

    // Reset UI to initial state
    function resetResponseUI() {
        document.getElementById('status-code').textContent = '-';
        document.getElementById('status-text').textContent = '';
        document.getElementById('response-time').textContent = '-';
        document.getElementById('response-size').textContent = '-';
        document.getElementById('size-unit').textContent = 'B';
        document.getElementById('response-protocol').textContent = 'HTTP';
        document.getElementById('protocol-version').textContent = '/1.1';
        responseBody.textContent = 'Send a request to see response body';
        responseHeaders.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">No headers received yet</td></tr>';
    }

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabs.forEach(t => {
                t.classList.remove('tab-active', 'text-gray-900');
                t.classList.add('text-gray-600');
            });
            
            // Add active class to clicked tab
            this.classList.add('tab-active', 'text-gray-900');
            this.classList.remove('text-gray-600');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show the selected tab content
            const selectedContent = document.querySelector(`[data-tab-content="${tabName}"]`);
            if (selectedContent) {
                selectedContent.classList.remove('hidden');
            }
        });
    });

    // Add new header row
    addHeaderBtn.addEventListener('click', function() {
        const newRow = document.createElement('div');
        newRow.className = 'header-row grid grid-cols-12 gap-4 mb-3';
        newRow.innerHTML = `
            <div class="col-span-5">
                <input type="text" placeholder="Key" class="w-full p-2 border border-gray-300 rounded font-mono">
            </div>
            <div class="col-span-5">
                <input type="text" placeholder="Value" class="w-full p-2 border border-gray-300 rounded font-mono">
            </div>
            <div class="col-span-2">
                <button class="remove-header-btn text-red-500 hover:text-red-700 w-full py-2">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        headersContainer.appendChild(newRow);
        
        // Add event listener to the remove button
        newRow.querySelector('.remove-header-btn').addEventListener('click', function() {
            newRow.remove();
        });
    });

    // Add new parameter row
    addParamBtn.addEventListener('click', function() {
        const newRow = document.createElement('div');
        newRow.className = 'grid grid-cols-12 gap-4 mb-3';
        newRow.setAttribute('data-param-row', '');
        newRow.innerHTML = `
            <div class="col-span-5">
                <input type="text" placeholder="parameter_name" class="w-full p-2 border border-gray-300 rounded">
            </div>
            <div class="col-span-5">
                <input type="text" placeholder="value" class="w-full p-2 border border-gray-300 rounded">
            </div>
            <div class="col-span-2">
                <button class="remove-param-btn text-red-500 hover:text-red-700 w-full py-2">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        paramsContainer.appendChild(newRow);
        
        // Add event listener to the remove button
        newRow.querySelector('.remove-param-btn').addEventListener('click', function() {
            newRow.remove();
        });
    });

    // Add event listeners to existing remove buttons
    document.querySelectorAll('.remove-header-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.header-row').remove();
        });
    });

    document.querySelectorAll('.remove-param-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('[data-param-row]').remove();
        });
    });

    // Send request button handler with abort functionality
    sendBtn.addEventListener('click', function() {
        // Abort previous request if it exists
        if (currentRequestAbortController) {
            currentRequestAbortController.abort();
        }
        
        // Create new abort controller for this request
        currentRequestAbortController = new AbortController();
        const signal = currentRequestAbortController.signal;
        
        const method = methodSelect.value;
        let url = urlInput.value;
        const headers = collectHeaders();
        const params = collectQueryParams();
        let body = method !== 'GET' && method !== 'HEAD' ? requestBody.value : null;
        
        // Validate URL
        if (!url) {
            alert('Please enter a URL');
            return;
        }
        
        // Add http:// if no protocol specified
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
            urlInput.value = url;
        }
        
        // Validate JSON body only if it exists and is not empty
        if (body && body.trim() !== '') {
            if (!isValidJson(body)) {
                alert('Request body is not valid JSON');
                return;
            }
            
            try {
                // Parse the JSON to ensure it's valid
                body = JSON.parse(body);
            } catch (e) {
                alert('Invalid JSON in request body');
                sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send';
                sendBtn.disabled = false;
                return;
            }
        } else {
            // If body is empty or only whitespace, set it to null
            body = null;
        }
        
        // Add query parameters to URL
        url = buildUrlWithParams(url, params);
        
        // Show loading state
        sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        sendBtn.disabled = true;
        
        // Reset response UI
        resetResponseUI();
        responseBody.textContent = 'Loading...';
        responseHeaders.innerHTML = '<tr><td class="px-4 py-3 text-sm text-gray-500 text-center" colspan="2">Loading headers...</td></tr>';
        
        // Prepare request data
        const requestData = {
            url: url,
            method: method,
            headers: headers
        };
        
        // Add body if applicable
        if (body) {
            requestData.body = body;
        }
        
        // Make request to our Django proxy
        fetch('/api/proxy/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(requestData),
            signal: signal
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Update UI with response
            updateResponseUI(data);
        })
        .catch(error => {
            if (error.name === 'AbortError') {
                console.log('Request aborted');
                responseBody.textContent = 'Request was cancelled';
            } else {
                console.error('Error:', error);
                responseBody.innerHTML = `<span class="text-red-600">Error: ${error.message}</span>`;
            }
        })
        .finally(() => {
            // Reset button state
            sendBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send';
            sendBtn.disabled = false;
            currentRequestAbortController = null;
        });
    });

    // Initialize with correct method color
    methodSelect.dispatchEvent(new Event('change'));
    
    // Initialize response UI
    resetResponseUI();
});