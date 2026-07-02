# 🚀 API Tester Pro

> A professional API testing platform built with **Django**, **Vanilla JavaScript**, and **Tailwind CSS** that provides browser DevTools–style request inspection with **nanosecond-precision network timing analysis**.

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-5.x-darkgreen?style=for-the-badge&logo=django)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?style=for-the-badge&logo=javascript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

# 📖 Overview

API Tester Pro is a modern web-based REST API testing application designed for developers who need detailed visibility into HTTP requests and responses.

Unlike traditional API clients, this project manually performs low-level socket communication to accurately measure each phase of an HTTP request, including:

- DNS Lookup
- TCP Connection
- SSL/TLS Handshake
- Request Upload
- Time To First Byte (TTFB)
- Content Download

The application provides a browser DevTools-like experience while eliminating browser CORS limitations using a Django backend proxy.

---

# ✨ Features

## 🌐 REST API Testing

Supports all major HTTP methods:

- GET
- POST
- PUT
- PATCH
- DELETE
- HEAD
- OPTIONS

---

## 📝 Request Builder

Create fully customized requests with:

- URL
- Query Parameters
- Custom Headers
- JSON Body
- Raw Text Body

---

## 🔐 Authentication Support

Built-in helpers for:

- Basic Authentication
- Bearer Token Authentication

Authorization headers are automatically generated and attached to requests.

---

## 🚫 No CORS Restrictions

Requests are routed through a Django backend proxy.

Benefits include:

- Test any public API
- Test internal APIs
- No browser CORS limitations
- No client-side restrictions

---

## 📨 Exact Request Echo

Displays the exact request sent to the server.

Including:

- Method
- URL
- Headers
- Automatically generated headers
- Request Body

Unlike browser-based fetch requests, every outgoing header can be inspected.

---

## 📥 Detailed Response Viewer

View:

- Status Code
- Status Text
- HTTP Version
- Response Headers
- Response Size
- JSON Response
- Plain Text Response

Responses are automatically formatted for readability.

---

## ⏱ Nanosecond Precision Timing

Every network phase is measured independently.

Timing includes:

| Phase | Description |
|--------|-------------|
| DNS Lookup | Domain resolution time |
| TCP Connection | TCP handshake duration |
| SSL Handshake | HTTPS negotiation time |
| Request Send | Upload duration |
| Waiting (TTFB) | Time To First Byte |
| Content Download | Response download time |
| Total | Overall request duration |

Measurements use:

```python
time.perf_counter_ns()
```

for maximum timing accuracy.

---

## 📊 Interactive Timing Analysis

Visual timing dashboard includes:

- Color-coded timing cards
- Horizontal timing graph
- Percentage distribution
- Millisecond precision
- DevTools-like layout

---

## 🎨 Modern Responsive UI

Built using:

- Tailwind CSS
- Vanilla JavaScript

Features include:

- Responsive Design
- Mobile Friendly
- Collapsible Panels
- Color-coded HTTP Methods
- Syntax Highlighted JSON
- Clean Dashboard Layout

---

# 🏗 Architecture

```
                Frontend
                     │
                     │
              HTTP Request
                     │
                     ▼
          Django Backend Proxy
                     │
     ┌───────────────┼───────────────┐
     │               │               │
 DNS Lookup     TCP Connection    SSL Handshake
     │               │               │
     └───────────────┼───────────────┘
                     │
             Raw Socket Request
                     │
                     ▼
              Target REST API
                     │
                     ▼
             Raw HTTP Response
                     │
                     ▼
          Timing + Parsing Engine
                     │
                     ▼
                Frontend UI
```

---

# ⚙ How It Works

## Step 1

The frontend prepares a JSON payload containing:

- URL
- Method
- Headers
- Request Body

---

## Step 2

The payload is sent to:

```
POST /api/proxy/
```

---

## Step 3

The Django backend asynchronously executes the request using:

- asyncio
- socket
- ssl

---

## Step 4

The backend performs:

- DNS Resolution
- TCP Connection
- SSL Handshake
- HTTP Request Construction
- Request Transmission
- Response Parsing

---

## Step 5

Each stage is individually timed using:

```
time.perf_counter_ns()
```

---

## Step 6

The backend returns:

- Response Body
- Headers
- Status
- Size
- HTTP Version
- Timing Breakdown
- Original Request Details

---

# 🧠 Raw Socket Implementation

Instead of using high-level HTTP libraries like:

- requests
- aiohttp
- httpx

API Tester Pro directly communicates using:

- socket
- ssl

This provides complete control over:

- TCP connections
- SSL negotiation
- HTTP message formatting
- Timing measurements
- Chunked transfer decoding

---

# 🔍 Timing Breakdown

The application measures:

### DNS Lookup

Hostname resolution time.

---

### TCP Connection

Time required to establish the TCP socket.

---

### SSL Handshake

TLS negotiation time for HTTPS requests.

---

### Request Upload

Time taken to send the HTTP request.

---

### Waiting (TTFB)

Time until the first byte of the response arrives.

---

### Content Download

Time required to receive the complete response body.

---

### Total

Overall request duration.

---

# 🛡 Special Handling

The application properly handles:

- IPv4
- IPv6
- HTTPS
- HTTP
- Chunked Transfer Encoding
- Content-Length Responses
- HEAD Requests
- OPTIONS Requests
- Keep-Alive Connections

No hanging requests.

No unnecessary waits.

---

# 📂 Tech Stack

### Backend

- Django
- Python
- AsyncIO
- Socket
- SSL
- WhiteNoise

### Frontend

- HTML5
- Tailwind CSS
- Vanilla JavaScript

---

# 📁 Project Structure

```
API-Tester-Pro/
│
├── api/
│
├── static/
│
├── templates/
│
├── requirements.txt
│
├── manage.py
│
└── README.md
```

---

# 🚀 Future Enhancements

- Request History
- Collections
- Environment Variables
- OAuth 2.0
- JWT Manager
- File Upload Support
- WebSocket Testing
- GraphQL Support
- cURL Import
- OpenAPI Import
- Postman Collection Import
- Export Responses
- Performance Reports

---

# 🎯 Key Highlights

✅ No CORS Restrictions

✅ Manual Socket Communication

✅ Nanosecond Timing Precision

✅ Full HTTP Request Inspection

✅ Browser DevTools–Style Timing Analysis

✅ Responsive Modern UI

✅ Chunked Transfer Support

✅ Async Django Backend

✅ IPv4 & IPv6 Compatible

✅ Production Ready

---

# 💡 Why This Project?

Traditional API testing tools often abstract away the networking layer.

API Tester Pro was built to expose every stage of an HTTP request, enabling developers to:

- Debug latency
- Verify outgoing headers
- Inspect request payloads
- Analyze network performance
- Understand HTTP internals
- Test APIs without browser limitations

It combines a modern user interface with low-level networking techniques to provide a powerful API debugging experience.

---

# 👨‍💻 Author

**Paras Mani**

M.Sc. Information Technology  
Full Stack Developer

- 💼 LinkedIn: *(Add your profile link)*
- 💻 GitHub: *(Add your GitHub profile link)*
- 📧 Email: *(Add your email address)*

---

# ⭐ Support

If you found this project useful, consider giving it a ⭐ on GitHub.

It helps others discover the project and motivates future development.

---

## 📜 License

This project is licensed under the **MIT License**.

Feel free to use, modify, and contribute.
