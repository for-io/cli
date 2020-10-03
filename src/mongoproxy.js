async function initDBState(db, data) {
  for (const collName in data) {
    if (data.hasOwnProperty(collName)) {

      const coll = db.collection(collName);
      const items = data[collName];

      await coll.deleteMany({});

      if (items.length > 0) {
        await coll.insertMany(items);
      }
    }
  }

  for (const coll of await db.collections()) {
    const collName = coll.s.namespace.collection;
    if (!data.hasOwnProperty(collName)) {
      coll.drop();
    }
  }
}

async function exportDBState(db) {
  const data = {};

  for (const coll of await db.collections()) {
    let collName = coll.s.namespace.collection;
    data[collName] = await coll.find().toArray();
  }

  return data;
}

async function executeMongoOps(db, payload) {
  try {

    const { coll, op, args = [], cursor, precondition, chain } = payload;

    await initDBState(db, precondition);

    const targetColl = db.collection(coll);
    let output = await targetColl[op](...args);

    for (const chainOp of chain) {
      output = await output[chainOp.name](...chainOp.args);
    }

    if (cursor) {
      output = output[cursor.op](...cursor.args);
    }

    const postcondition = await exportDBState(db, Object.keys(precondition));

    return { output, postcondition };

  } catch (e) {
    // console.debug(e);
    return { message: e.message, error: e + '' };
  }
}

module.exports = { executeMongoOps };
