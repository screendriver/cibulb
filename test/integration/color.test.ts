import { assert } from 'chai';
import got from 'got';
import AWS, { Credentials } from 'aws-sdk';
import { createFunction, deleteFunction } from './lambda';
import { createRestApi, RestApi, deleteRestApi } from './apigateway';
import { assertIsString } from './assert';

let colorFunctionArn: string | undefined = undefined;
let restApi: RestApi;

suite('color', function() {
  suiteSetup(async function() {
    AWS.config.update({
      credentials: new Credentials('myAccessKeyId', 'mySecretAccessKey'),
      region: 'eu-central-1',
    });
    colorFunctionArn = (await createFunction('color')).FunctionArn;
    assertIsString(colorFunctionArn);
    restApi = await createRestApi(colorFunctionArn, 'color');
  });

  suiteTeardown(async function() {
    await deleteFunction('color');
    await deleteRestApi(restApi.restApiId);
  });

  test('bla', async function() {
    this.timeout(20000);
    const body = await got(restApi.url, { resolveBodyOnly: true });
    assert.strictEqual(body, 'Color ole ole /color');
  });
});
