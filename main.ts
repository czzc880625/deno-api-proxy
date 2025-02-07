const express = require('express');
const app = express();

app.use((req, res, next) => {
    const pathname = req.url;

    if (pathname === '/' || pathname === '/index.html') {
        res.status(200).setHeader('Content-Type', 'text/html');
        res.send('Proxy is Running！Details：https://github.com/tech-shrimp/deno-api-proxy');
        return;
    }

    const targetUrl = `https://${pathname}`;

    const allowedHeaders = ['accept', 'content-type', 'authorization'];
    const headers = {};

    for (const [key, value] of Object.entries(req.headers)) {
        if (allowedHeaders.includes(key.toLowerCase())) {
            headers[key] = value;
        }
    }

    headers['Referrer-Policy'] = 'no-referrer';

    const options = {
        method: req.method,
        headers: headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        options.body = req.body;
    }

    fetch(targetUrl, options)
        .then(response => {
            const responseHeaders = {};
            for (const [key, value] of response.raw.headers.entries()) {
                responseHeaders[key] = value;
            }
            responseHeaders['Access-Control-Allow-Origin'] = '*';
            responseHeaders['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
            responseHeaders['Access-Control-Allow-Headers'] = 'X-Requested-With, content-type, authorization';

            res.status(response.status);
            res.headers = responseHeaders;
            res.send(response.body);
        })
        .catch(error => {
            console.error('Failed to fetch:', error);
            res.status(500).send('Internal Server Error');
        });
});

module.exports = app;
