/*!
 * for-io-cli
 *
 * Copyright (c) 2020 Nikolche Mihajlovski
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const http = require('http');
const express = require('express');
const cors = require('cors');
const services = require('./services');
const { listenAndWatchDir } = require('./watcher');

async function start({ token, origin, mongoUrl, port, ttl, debugMode, workspace }) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use(cors({ origin }));

  const router = express.Router();
  services.init(router, { mongoUrl, token, debugMode });
  app.use('/', router);

  app.set('port', port);

  const server = http.createServer(app);
  server.on('error', onError);

  if (workspace) {
    listenAndWatchDir({ workspaceDir: workspace, expectedToken: token, server, origin });
  }

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