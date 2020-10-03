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