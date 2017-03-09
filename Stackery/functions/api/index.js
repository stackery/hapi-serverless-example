"use strict"

const server = require('ProductsAPI')

module.exports = function handler(message) {
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
