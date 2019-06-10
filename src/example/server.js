#!/usr/bin/env node

var http = require('http');
var fs   = require('fs');

http.createServer(function (request, response) {
  var url = request.url;

  if (url === '/') { url = '/index.html'; }

  var url = url.split('?')[0];

  if (/\/$/.test(url)) {
    url += 'index.html';
  }

  var chunks = url.split('.');
  var extension = chunks[chunks.length - 1];

  if (/^ico/i.test(extension)) {
    response.writeHead(404, {});
    response.end();
    return;
  }
  if (/^map$/i.test(extension)) {
    response.writeHead(404, {});
    response.end();
    return;
  }

  var contentType = 'text/html';

  // or may be leave them to browser with no Content-Type header
  if (/^js$/i.test(extension)) {
    contentType = 'text/javascript';
  } else if (/^json$/i.test(extension)) {
    contentType = 'text/json';
  } else if (/^png$/i.test(extension)) {
    contentType = 'image/png';
  }

  fs.readFile('./www/' + url, function (error, content) {
    if (error) { console.log(error); throw error; }

    response.writeHead(200, {'Content-Type': contentType});
    response.write(content);
    response.end();
  });
}).listen(8880, 'localhost');
