const http = require('http');
const express = require('express');
const cors = require('cors');
const services = require('./services');

async function start({ token, origin, mongoUrl, port, ttl, debugMode }) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cors({ origin }));

  const router = express.Router();
  services.init(router, { mongoUrl, token, debugMode });
  app.use('/', router);

  app.set('port', port);

  let server = http.createServer(app);
  server.on('error', onError);

  function onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }

    switch (error.code) {
      case 'EACCES':
        console.error(`Port ${port} requires elevated privileges`);
        process.exit(1);
        break;

      case 'EADDRINUSE':
        console.error(`Port ${port} is already in use`);
        process.exit(1);
        break;

      default:
        throw error;
    }
  }

  return new Promise(function (resolve, reject) {
    server.listen(port, 'localhost', () => {
      let addr = server.address();

      console.log(`Waiting for the browser to connect from ${origin} to ${addr.address}:${addr.port}`);

      if (ttl) {
        setTimeout(() => {
          console.log('Closing the server.');
          services.close();
          server.close();
        }, ttl * 1000);
      }

      resolve();
    });
  });
}

module.exports = { start };