let fs = require('fs');
const url = require('url');

// initialize with messages from local file 
let messages = JSON.parse(fs.readFileSync(__dirname + '/messages.json').toString());

var requestHandler = function(request, response) {
  console.log('Serving request type ' + request.method + ' for url ' + request.url);

  // Just get endpoint that we are trying to locate, excluding query strings
  const parsedUrl = url.parse(request.url).pathname

  // if our request url does not match /classes/messages
  if (parsedUrl !== '/classes/messages' && parsedUrl !== '/classes/messages/get' ) {
    var statusCode = 404;

    /* 
     * corseheaders is a mechanism that uses additional HTTP headers to tell a browser
     * to let a web application running at one origin (domain) have permission 
     * to access selected resources from a server at a different origin
     */
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'text/plain';
    response.writeHead(statusCode, headers);

    response.end('404 not found');
  }
  
  if (parsedUrl === '/classes/messages' && (request.method === 'GET' || request.method === 'OPTIONS')) {  
    // send index file
    fs.readFile(__dirname + '/../client/hrla24-chatterbox-client/client/index.html', (err, data) => {
      if (err) {
        console.log(err);
      } else {
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'text/html';
        response.writeHead(200, headers);
    
        response.end(data);
      }
    });
  }

  if (request.url === '/classes/messages/get' && request.method === 'GET') {
    // send messages
    var headers = defaultCorsHeaders;
    headers['Content-Type'] = 'application/json';
    response.writeHead(200, headers);

    let responseObj = {
      results: messages,
    };
    response.end(JSON.stringify(responseObj));
  }

  if (parsedUrl === '/classes/messages/get' && request.method === 'POST') {
    let data = [];
    // consume request data stream
    request.on('data', (buffer) => {
      data.push(buffer);
    });

    request.on('end', () => {
      data = Buffer.concat(data).toString();  

      messages.unshift(JSON.parse(data));
      
      //store updated messages array to messages.json (JSON since we storing data)
      //vv//format into a much readable Object literal syntax 
      fs.writeFile(__dirname + '/messages.json', JSON.stringify(messages, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');

        var statusCode = 201;
        var headers = defaultCorsHeaders;
        headers['Content-Type'] = 'application/json';
        response.writeHead(statusCode, headers);

        let responseObj = {
          results: messages,
        };
        response.end(JSON.stringify(responseObj));
      });
    });
  }

  if(parsedUrl === '/classes/messages/get' && request.method === 'DELETE') {
    let toDelete;
    
    request.on('data', (data) => {
      // find the specified ID of the selected message from the client
      toDelete = data.toString();
    });

    request.on('end', () => {
      // splice the id (index) from the server's messages array
      messages.splice(+JSON.parse(toDelete), 1);

      // re write updated messages
      fs.writeFile(__dirname + '/messages.json', JSON.stringify(messages, null, 2), (err) => {
        if (err) throw err;
        console.log('The file has been saved!');

        var statusCode = 202;
        var headers = defaultCorsHeaders;

        headers['Content-Type'] = 'application/json';
        response.writeHead(statusCode, headers);

        response.end(JSON.stringify({
          message: 'Success',
        }));
      });
    });
  }
  // // See the note below about CORS headers.
  // var headers = defaultCorsHeaders;

  // // Tell the client we are sending them plain text.
  // //
  // // You will need to change this if you are sending something
  // // other than plain text, like JSON or HTML.
  // headers['Content-Type'] = 'text/plain';

  // // .writeHead() writes to the request line and headers of the response,
  // // which includes the status and all headers.
  // response.writeHead(statusCode, headers);

  // // Make sure to always call response.end() - Node may not send
  // // anything back to the client until you do. The string you pass to
  // // response.end() will be the body of the response - i.e. what shows
  // // up in the browser.
  // //
  // // Calling .end "flushes" the response's internal buffer, forcing
  // // node to actually send all the data over to the client.
  // response.end('Hello, World!');
};

// These headers will allow Cross-Origin Resource Sharing (CORS).
// This code allows this server to talk to websites that
// are on different domains, for instance, your chat client.
//
// Your chat client is running from a url like file://your/chat/client/index.html,
// which is considered a different domain.
//
// Another way to get around this restriction is to serve you chat
// client from this domain by setting up static file serving.
var defaultCorsHeaders = {
  'access-control-allow-origin': '*', // what is this
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

module.exports.requestHandler = requestHandler;
module.exports.defaultCorsHeaders = defaultCorsHeaders;