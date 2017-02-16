# Stackery Hapi Serverless API Example

This example shows how an existing [hapi](https://hapijs.com/) API can be used with Stackery to run on a serverless infrastructure.

### How?
This repo contains a Stackery stack that can be forked and imported into your own Stackery account. The stack contains two nodes: a [Rest Api node](https://docs.stackery.io/nodes/RestApi/index.html) and a [Function node](https://docs.stackery.io/nodes/Function/index.html).

The Function node is a small wrapper around [hapi-example](https://github.com/stackery/hapi-example). Only one modification to hapi apps is needed to enable them to work in serverless use cases: preventing the server from listening for HTTP connections when used as a dependency of a serverless function. You can see the modification [here](https://github.com/stackery/hapi-example/commit/4566a27427d4c408dc1be83daaae033219090405). With this change the server can still be run locally by running `node server.js`. This is great for local testing purposes!

The only other piece of functionality needed is a hookup between an incoming Stackery [HTTP request message](https://docs.stackery.io/nodes/RestApi/index.html#output) and the hapi server, and then a hookup between the hapi response and the Stackery [HTTP response](https://docs.stackery.io/nodes/RestApi/index.html#expected-response). This is performed by the [api function handler](Stackery/functions/api/index.js):

```node
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

### Why?
Using serverless technologies for APIs provides multiple benefits:
* Requests are handled in parallel with unbounded horizontal scalability.
* Increased infrastructure efficiency because serverless functions run only when API requests are made. Infrequently accessed APIs no longer require base-line server instance costs.
* Ops overhead is reduced as much of the engineering challenges around scalability are handled automatically by the infrastructure provider.

### Prerequisites
* [Stackery](https://stackery.io) account
* [AWS](https://aws.amazon.com) account with an unused [API Gateway Custom Domain](http://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-custom-domains.html) (e.g. _hapi-demo.example.com_)

### Steps To Deploy
1. Fork this repo to your own GitHub account (you will need write access to it)
1. Log into [Stackery](https://app.stackery.io)
1. Create a new Stackery stack
  1. Name the stack (e.g. _hapi-demo_)
  1. Choose to **Import Stack From GitHub**
  1. Connect your account to GitHub if needed
  1. Select your fork of this repo from the list of repos
  1. Create stack!
1. Double click on the Rest Api node on the left and select your custom domain from the drop down
  * If you don't see your domain in the drop down, check that the domain exists in API Gateway for the region you provisioned Stackery into.
1. Deploy your stack
  1. Click the **Deploy** button in the top right corner of the Stackery dashboard, then select the _Default_ deployment
  1. Switch to the _Default_ deployment tab
  1. Once the deployment change set has been created, click on the change set link to be taken to [AWS CloudFormation](https://aws.amazon.com/cloudformation/) to execute the change set
  1. Back in the Stackery dashboard, wait for the deployment to be deployed
  1. Navigate to your domain and test it out! (e.g. _https://hapi-demo.example.com/products_)
