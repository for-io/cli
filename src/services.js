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

const mongodb = require('mongodb');
const mongoproxy = require('./mongoproxy');

let mongoClient;
let conn;

async function init(router, opts) {
  const { token, mongoUrl } = opts;

  if (!mongoClient) {
    console.log(`Connecting to ${mongoUrl}`);
    mongoClient = new mongodb.MongoClient(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  if (!conn) conn = await mongoClient.connect();
  const db = conn.db('for-io-test');

  router.post('/mongo', async (req, res) => {
    const reqToken = req.body.token;

    if (reqToken === token) {
      const output = await mongoproxy.executeMongoOps(db, req.body.payload);
      res.json(output);

    } else {
      const debugInfo = opts.debugMode ? ` Expected: "${token}", received: "${reqToken}".` : '';
      console.warn('Invalid token received!' + debugInfo);
      res.json({ error: 'Invalid token!' });
    }
  });
}

async function close() {
  if (conn) await conn.close();
  await mongoClient.close();
}

module.exports = { init, close };