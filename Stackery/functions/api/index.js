'use strict';

const server = require('ProductsAPI');

module.exports = function handler (event, context, callback) {
  console.log(event);
  /* Transform Api Gateway message to request message for hapi */
  let request = {
    method: event.httpMethod,
    url: event.path,
    headers: event.headers,
    payload: event.body,
    remoteAddress: event.ip
  };

  return server.initialize()
    .then(() => server.inject(request))
    .then((response) => {
      console.log(response);
      /* Transform hapi response to Api Gateway response message */
      callback(null, {
        statusCode: response.statusCode,
        headers: response.headers,
        body: response.payload
      });
    });
};
