import { APIGateway } from 'aws-sdk';
import pPipe from 'p-pipe';
import { assertIsString } from './assert';

interface CreatePipeArgument {
  gateway: APIGateway;
  restApiId: string;
  rootResourceId: string;
  pathResourceId: string;
  lambdaFunctionArn: string;
}

export interface RestApi {
  url: string;
  restApiId: string;
}

function createApiGateway() {
  return new APIGateway({
    endpoint: 'http://localhost:4567',
  });
}

async function createRestApiService(
  pipeArgument: CreatePipeArgument,
): Promise<CreatePipeArgument> {
  const { id: restApiId } = await pipeArgument.gateway
    .createRestApi({
      name: 'test',
    })
    .promise();
  assertIsString(restApiId);
  return { ...pipeArgument, restApiId };
}

async function getRootResourceId(
  pipeArgument: CreatePipeArgument,
): Promise<CreatePipeArgument> {
  const { gateway, restApiId } = pipeArgument;
  const resources = await gateway.getResources({ restApiId }).promise();
  const resourcesItems = resources.items ?? [];
  const rootResourceId = resourcesItems.reduceRight<string | undefined>(
    (_previousValue, currentValue) => {
      return currentValue.id;
    },
    undefined,
  );
  assertIsString(rootResourceId);
  return { ...pipeArgument, rootResourceId };
}

function createPathResource(path: string) {
  return async (
    pipeArgument: CreatePipeArgument,
  ): Promise<CreatePipeArgument> => {
    const { gateway, restApiId, rootResourceId } = pipeArgument;
    const { id: pathResourceId } = await gateway
      .createResource({
        restApiId,
        parentId: rootResourceId,
        pathPart: path,
      })
      .promise();
    assertIsString(pathResourceId);
    return { ...pipeArgument, pathResourceId };
  };
}

async function putMethod(pipeArgument: CreatePipeArgument) {
  const { gateway, restApiId, pathResourceId } = pipeArgument;
  await gateway
    .putMethod({
      restApiId,
      resourceId: pathResourceId,
      httpMethod: 'GET',
      authorizationType: 'NONE',
    })
    .promise();
  return pipeArgument;
}

async function putMethodResponse(pipeArgument: CreatePipeArgument) {
  const { gateway, restApiId, pathResourceId } = pipeArgument;
  await gateway
    .putMethodResponse({
      restApiId,
      resourceId: pathResourceId,
      httpMethod: 'GET',
      statusCode: '200',
    })
    .promise();
  return pipeArgument;
}

async function putIntegration(pipeArgument: CreatePipeArgument) {
  const {
    gateway,
    restApiId,
    pathResourceId,
    lambdaFunctionArn,
  } = pipeArgument;
  await gateway
    .putIntegration({
      restApiId,
      resourceId: pathResourceId,
      httpMethod: 'GET',
      type: 'AWS_PROXY',
      integrationHttpMethod: 'POST',
      uri: `arn:aws:apigateway:eu-central-1:lambda:path/2015-03-31/functions/${lambdaFunctionArn}/invocations`,
    })
    .promise();
  return pipeArgument;
}

async function putIntegrationResponse(pipeArgument: CreatePipeArgument) {
  const { gateway, restApiId, pathResourceId } = pipeArgument;
  await gateway
    .putIntegrationResponse({
      restApiId,
      resourceId: pathResourceId,
      httpMethod: 'GET',
      statusCode: '200',
      selectionPattern: '',
      responseTemplates: {},
    })
    .promise();
  return pipeArgument;
}

async function createDeployment(pipeArgument: CreatePipeArgument) {
  const { gateway, restApiId } = pipeArgument;
  await gateway
    .createDeployment({
      restApiId,
      stageName: 'test',
    })
    .promise();
  return pipeArgument;
}

export async function createRestApi(
  lambdaFunctionArn: string,
  path: string,
): Promise<RestApi> {
  const gateway = createApiGateway();
  const pipeArgument: CreatePipeArgument = {
    gateway,
    restApiId: '',
    rootResourceId: '',
    pathResourceId: '',
    lambdaFunctionArn,
  };
  const { restApiId } = await pPipe(
    createRestApiService,
    getRootResourceId,
    createPathResource(path),
    putMethod,
    putMethodResponse,
    putIntegration,
    putIntegrationResponse,
    createDeployment,
  )(pipeArgument);
  return {
    url: `http://localhost:4567/restapis/${restApiId}/test/_user_request_/color`,
    restApiId,
  };
}

export async function deleteRestApi(restApiId: string) {
  const gateway = createApiGateway();
  await gateway.deleteRestApi({ restApiId }).promise();
}
