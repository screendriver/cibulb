import test from 'tape';
import micro from 'micro';
import MongoMemoryServer from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import listen from 'test-listen';
import got from 'got';
import colorFunction from '../../../src/color/';
import { Repository } from '../../../src/shared/mongodb';

async function createMongoDb(): Promise<
  [MongoMemoryServer, MongoClient, string]
> {
  const mongod = new MongoMemoryServer();
  const uri = await mongod.getConnectionString();
  const client = await MongoClient.connect(uri, { useNewUrlParser: true });
  await client.db('cibulb').createCollection('repositories');
  return [mongod, client, uri];
}

function setupEnvs(iftttUrl: string, mongoUri: string) {
  process.env.GITHUB_SECRET = 'my-secret';
  process.env.IFTTT_BASE_URL = iftttUrl;
  process.env.IFTTT_KEY = 'my-key';
  process.env.MONGO_URI = mongoUri;
}

function deleteEnvs() {
  delete process.env.GITHUB_SECRET;
  delete process.env.IFTTT_BASE_URL;
  delete process.env.IFTTT_KEY;
  delete process.env.MONGO_URI;
}

test('call IFTTT webhook event "ci_build_success"', async t => {
  t.plan(1);
  const [mongod, mongoClient, mongoUri] = await createMongoDb();
  const iftttService = micro(req => {
    t.equal(req.url, '/trigger/ci_build_success/with/key/my-key');
    return '';
  });
  const colorFunctionService = micro(async (req, res) => {
    await colorFunction(req, res);
    res.end();
  });
  const iftttServiceUrl = await listen(iftttService);
  const colorFunctionUrl = await listen(colorFunctionService);
  setupEnvs(iftttServiceUrl, mongoUri);
  try {
    await got.post(colorFunctionUrl, {
      json: true,
      headers: {
        'x-hub-signature': 'sha1=7222a793428d77051ab41c61ee85305d0ea3da80',
      },
      body: {
        id: 123,
        name: 'test',
        state: 'success',
        branches: [{ name: 'master' }],
      },
    });
  } finally {
    iftttService.close();
    colorFunctionService.close();
    await mongoClient.close();
    await mongod.stop();
    deleteEnvs();
  }
});

test('inserts repository name and state into MongoDB', async t => {
  t.plan(1);
  const [mongod, mongoClient, mongoUri] = await createMongoDb();
  const iftttService = micro(() => '');
  const colorFunctionService = micro(async (req, res) => {
    await colorFunction(req, res);
    res.end();
  });
  const iftttServiceUrl = await listen(iftttService);
  const colorFunctionUrl = await listen(colorFunctionService);
  setupEnvs(iftttServiceUrl, mongoUri);
  try {
    await got.post(colorFunctionUrl, {
      json: true,
      headers: {
        'x-hub-signature': 'sha1=7222a793428d77051ab41c61ee85305d0ea3da80',
      },
      body: {
        id: 123,
        name: 'test',
        state: 'success',
        branches: [{ name: 'master' }],
      },
    });
    const repos = await mongoClient
      .db('cibulb')
      .collection<Repository>('repositories')
      .find()
      .toArray();
    t.deepEqual(repos.map(({ name, state }) => ({ name, state }))[0], {
      name: 'test',
      state: 'success',
    });
  } finally {
    iftttService.close();
    colorFunctionService.close();
    await mongoClient.close();
    await mongod.stop();
    deleteEnvs();
  }
});

test('updates repository state in MongoDB', async t => {
  t.plan(1);
  const [mongod, mongoClient, mongoUri] = await createMongoDb();
  await mongoClient
    .db('cibulb')
    .collection<Repository>('repositories')
    .insertOne({ name: 'test', state: 'pending' });
  const iftttService = micro(() => '');
  const colorFunctionService = micro(async (req, res) => {
    await colorFunction(req, res);
    res.end();
  });
  const iftttServiceUrl = await listen(iftttService);
  const colorFunctionUrl = await listen(colorFunctionService);
  setupEnvs(iftttServiceUrl, mongoUri);
  try {
    await got.post(colorFunctionUrl, {
      json: true,
      headers: {
        'x-hub-signature': 'sha1=7222a793428d77051ab41c61ee85305d0ea3da80',
      },
      body: {
        id: 123,
        name: 'test',
        state: 'success',
        branches: [{ name: 'master' }],
      },
    });
    const repos = await mongoClient
      .db('cibulb')
      .collection<Repository>('repositories')
      .find()
      .toArray();
    t.deepEqual(repos.map(({ name, state }) => ({ name, state }))[0], {
      name: 'test',
      state: 'success',
    });
  } finally {
    iftttService.close();
    colorFunctionService.close();
    await mongoClient.close();
    await mongod.stop();
    deleteEnvs();
  }
});
