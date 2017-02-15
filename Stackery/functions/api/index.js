"use strict"

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
    /* We don't actually want the server to listen for connections in serverless
     * mode, so stop it */
    .then(() => server.stop())
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
