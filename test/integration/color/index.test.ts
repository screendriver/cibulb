import { expect } from 'chai';
import micro from 'micro';
import { NowRequest, NowResponse } from '@now/node';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongoClient } from 'mongodb';
import listen from 'test-listen';
import got from 'got';
import log from 'loglevel';
import colorFunction from '../../../api/color';
import { Repository } from '../../../api/shared/mongodb';
import { Server } from 'http';

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

function createColorFunctionService() {
  return micro(async (req, res) => {
    await colorFunction(req as NowRequest, res as NowResponse);
    res.end();
  });
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

async function closeAll(
  iftttService: Server,
  colorFunctionService: Server,
  mongoClient: MongoClient,
  mongod: MongoMemoryServer,
) {
  iftttService.close();
  colorFunctionService.close();
  await mongoClient.close();
  await mongod.stop();
  deleteEnvs();
}

async function getRepositories(
  mongod: MongoMemoryServer,
  mongoClient: MongoClient,
  mongoUri: string,
) {
  const iftttService = micro(() => '');
  const colorFunctionService = createColorFunctionService();
  const iftttServiceUrl = await listen(iftttService);
  const colorFunctionUrl = await listen(colorFunctionService);
  setupEnvs(iftttServiceUrl, mongoUri);
  try {
    await doNetworkRequest(colorFunctionUrl);
    return mongoClient
      .db('cibulb')
      .collection<Repository>('repositories')
      .find()
      .toArray();
  } finally {
    await closeAll(iftttService, colorFunctionService, mongoClient, mongod);
  }
}

function getNameAndStatus(repos: Repository[]) {
  return repos
    .map(({ name, status }) => ({ name, status }))
    .reduce((_, currentValue) => currentValue);
}

describe('color', () => {
  it('returns HTTP 403 when secret is not valid', async () => {
    process.env.GITLAB_SECRET_TOKEN = 'foo';
    const colorFunctionService = createColorFunctionService();
    const colorFunctionUrl = await listen(colorFunctionService);
    try {
      const response = await doNetworkRequest(colorFunctionUrl);
      expect(response.statusCode).to.equal(403);
    } finally {
      colorFunctionService.close();
      deleteEnvs();
    }
  });

  it('call IFTTT webhook event "ci_build_success"', async () => {
    const [mongod, mongoClient, mongoUri] = await createMongoDb();
    const iftttService = micro(req => {
      expect(req.url).to.equal('/trigger/ci_build_success/with/key/my-key');
      return '';
    });
    const colorFunctionService = createColorFunctionService();
    const iftttServiceUrl = await listen(iftttService);
    const colorFunctionUrl = await listen(colorFunctionService);
    setupEnvs(iftttServiceUrl, mongoUri);
    try {
      await doNetworkRequest(colorFunctionUrl);
    } finally {
      await closeAll(iftttService, colorFunctionService, mongoClient, mongod);
    }
  });

  it('inserts repository name and status into MongoDB', async () => {
    const [mongod, mongoClient, mongoUri] = await createMongoDb();
    const repos = await getRepositories(mongod, mongoClient, mongoUri);
    expect(getNameAndStatus(repos)).to.deep.equal({
      name: 'test',
      status: 'success',
    });
  });

  it('updates repository status in MongoDB', async () => {
    const [mongod, mongoClient, mongoUri] = await createMongoDb();
    await mongoClient
      .db('cibulb')
      .collection<Repository>('repositories')
      .insertOne({
        name: 'test',
        status: 'pending',
      });
    const repos = await getRepositories(mongod, mongoClient, mongoUri);
    expect(getNameAndStatus(repos)).to.deep.equal({
      name: 'test',
      status: 'success',
    });
  });
});
