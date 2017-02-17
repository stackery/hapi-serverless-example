# Stackery Hapi Serverless API Example

This example shows how an existing [hapi](https://hapijs.com/) API can be used with Stackery to run on a serverless infrastructure.

### Why?
Using serverless technologies for APIs provides multiple benefits:
* Requests are handled in parallel with unbounded horizontal scalability.
* Increased infrastructure efficiency because serverless functions run only when API requests are made. Infrequently accessed APIs no longer require base-line server instance costs.
* Ops overhead is reduced as much of the engineering challenges around scalability are handled automatically by the infrastructure provider.

However, most serverless-based APIs are built by decomposing functionality into individual functions servicing only one endpoint. This can be challenging to maintain due to the complexities of managing helper functionality used across multiple endpoints.

Instead, we can build a single function servicing all requests using a mature, popular API framework like [hapi](https://hapijs.com/). This way developers can use tools and techniques they are already familiar with to power their API services.

### How?
This repo contains a Stackery stack that can be forked and imported into your own Stackery account. The stack contains two nodes: a [Rest Api node](https://docs.stackery.io/nodes/RestApi/index.html) and a [Function node](https://docs.stackery.io/nodes/Function/index.html).

The Function node is a small wrapper around [hapi-example](https://github.com/stackery/hapi-example). Only one modification to hapi apps is needed to enable them to work in serverless use cases: preventing the server from listening for HTTP connections when used as a dependency of a serverless function. You can see the modification [here](https://github.com/stackery/hapi-example/commit/4566a27427d4c408dc1be83daaae033219090405). With this change the server can still be run locally by running `node server.js`. This is great for local testing purposes!

The only other piece of functionality needed is a hookup between an incoming Stackery [HTTP request message](https://docs.stackery.io/nodes/RestApi/index.html#output) and the hapi server, and then a hookup between the hapi response and the Stackery [HTTP response](https://docs.stackery.io/nodes/RestApi/index.html#expected-response). This is performed by the [api function handler](Stackery/functions/api/index.js):

```javascript
const server = require('ProductsAPI')

module.exports = function handler(message, output) {
  /* If you want to output messages to further nodes, you can put the output
   * function on the server object: */
  server.app.output = output

  /* Transform Stackery message to request message for hapi */
  let request = {
        method: message.method,
        url: message.pathname,
        headers: message.headers,
        payload: message.body,
        remoteAddress: message.ip
      }

  return server.initialize()
    .then(() => server.inject(request))
    .then((response) => {
      /* Transform hapi response to Stackery Rest Api response message */
      return {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.rawPayload
      }
    })
}
```

### Let's Get Started!
The full instructions are in this [guide](https://docs.stackery.io/guides/hapi#prerequisites)
