import test from 'tape';
import micro from 'micro';
import MongoMemoryServer from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import listen from 'test-listen';
import got from 'got';
import log from 'loglevel';
import colorFunction from '../../../src/color/';
import { Repository } from '../../../src/shared/mongodb';

log.disableAll();

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
  process.env.GITLAB_SECRET_TOKEN = 'my-secret';
  process.env.IFTTT_BASE_URL = iftttUrl;
  process.env.IFTTT_KEY = 'my-key';
  process.env.MONGO_URI = mongoUri;
  process.env.SENTRY_DSN = 'http://localhost';
}

function deleteEnvs() {
  delete process.env.GITLAB_SECRET_TOKEN;
  delete process.env.IFTTT_BASE_URL;
  delete process.env.IFTTT_KEY;
  delete process.env.MONGO_URI;
  delete process.env.SENTRY_DSN;
}

function doNetworkRequest(url: string) {
  return got.post(url, {
    json: true,
    throwHttpErrors: false,
    headers: {
      'x-gitlab-token': 'my-secret',
    },
    body: {
      object_attributes: {
        id: 123,
        ref: 'master',
        status: 'success',
      },
      project: {
        path_with_namespace: 'test',
      },
    },
  });
}

test('returns HTTP 403 when secret is not valid', async t => {
  t.plan(1);
  process.env.GITLAB_SECRET_TOKEN = 'foo';
  const colorFunctionService = micro(async (req, res) => {
    await colorFunction(req, res);
    res.end();
  });
  const colorFunctionUrl = await listen(colorFunctionService);
  try {
    const response = await doNetworkRequest(colorFunctionUrl);
    t.equal(response.statusCode, 403);
  } finally {
    colorFunctionService.close();
    deleteEnvs();
  }
});

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
    await doNetworkRequest(colorFunctionUrl);
  } finally {
    iftttService.close();
    colorFunctionService.close();
    await mongoClient.close();
    await mongod.stop();
    deleteEnvs();
  }
});

test('inserts repository name and status into MongoDB', async t => {
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
    await doNetworkRequest(colorFunctionUrl);
    const repos = await mongoClient
      .db('cibulb')
      .collection<Repository>('repositories')
      .find()
      .toArray();
    t.deepEqual(repos.map(({ name, status }) => ({ name, status }))[0], {
      name: 'test',
      status: 'success',
    });
  } finally {
    iftttService.close();
    colorFunctionService.close();
    await mongoClient.close();
    await mongod.stop();
    deleteEnvs();
  }
});

test('updates repository status in MongoDB', async t => {
  t.plan(1);
  const [mongod, mongoClient, mongoUri] = await createMongoDb();
  await mongoClient
    .db('cibulb')
    .collection<Repository>('repositories')
    .insertOne({ name: 'test', status: 'pending' });
  const iftttService = micro(() => '');
  const colorFunctionService = micro(async (req, res) => {
    await colorFunction(req, res);
    res.end();
  });
  const iftttServiceUrl = await listen(iftttService);
  const colorFunctionUrl = await listen(colorFunctionService);
  setupEnvs(iftttServiceUrl, mongoUri);
  try {
    await doNetworkRequest(colorFunctionUrl);
    const repos = await mongoClient
      .db('cibulb')
      .collection<Repository>('repositories')
      .find()
      .toArray();
    t.deepEqual(repos.map(({ name, status }) => ({ name, status }))[0], {
      name: 'test',
      status: 'success',
    });
  } finally {
    iftttService.close();
    colorFunctionService.close();
    await mongoClient.close();
    await mongod.stop();
    deleteEnvs();
  }
});
