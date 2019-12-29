import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as sns from '@aws-cdk/aws-sns';
import * as snsSubs from '@aws-cdk/aws-sns-subscriptions';

const lambdaRuntime = { runtime: lambda.Runtime.NODEJS_12_X };
const sentryDsn = { SENTRY_DSN: process.env.SENTRY_DSN ?? '' };
const dynamoDbTableName = { DYNAMO_DB_TABLE_NAME: 'Repositories' };
const dynamoDbPrimaryKey = { DYNAMO_DB_PRIMARY_KEY: 'Name' };

export class CiBulbCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const colorHandler = new lambda.Function(this, 'ColorHandler', {
      ...lambdaRuntime,
      code: lambda.Code.fromAsset('target/lambda/'),
      handler: 'color.handler',
      environment: {
        ...sentryDsn,
        ...dynamoDbTableName,
        ...dynamoDbPrimaryKey,
        GITLAB_SECRET_TOKEN: process.env.GITLAB_SECRET_TOKEN ?? '',
      },
    });

    const refreshHandler = new lambda.Function(this, 'RefreshHandler', {
      ...lambdaRuntime,
      code: lambda.Code.fromAsset('target/lambda/'),
      handler: 'refresh.handler',
      environment: {
        ...sentryDsn,
        ...dynamoDbTableName,
        ...dynamoDbPrimaryKey,
      },
    });

    const iftttHandler = new lambda.Function(this, 'IftttHandler', {
      ...lambdaRuntime,
      code: lambda.Code.fromAsset('target/lambda/'),
      handler: 'ifttt.handler',
      environment: {
        ...sentryDsn,
        IFTTT_BASE_URL: process.env.IFTTT_BASE_URL ?? '',
        IFTTT_KEY: process.env.IFTTT_KEY ?? '',
      },
    });

    const dynamoTable = new dynamodb.Table(this, 'Repositories', {
      partitionKey: {
        name: dynamoDbPrimaryKey.DYNAMO_DB_PRIMARY_KEY,
        type: dynamodb.AttributeType.STRING,
      },
      tableName: dynamoDbTableName.DYNAMO_DB_TABLE_NAME,
      readCapacity: 1,
      writeCapacity: 1,
    });
    dynamoTable.grantReadWriteData(colorHandler);
    dynamoTable.grantReadData(refreshHandler);

    const topic = new sns.Topic(this, 'IftttTopic', {
      displayName: 'IFTTT Webhooks Topic',
    });
    topic.addSubscription(new snsSubs.LambdaSubscription(iftttHandler));

    const api = new apigateway.RestApi(this, 'CibulbApi');

    const colorIntegration = new apigateway.LambdaIntegration(colorHandler);
    const color = api.root.addResource('color');
    color.addMethod('POST', colorIntegration);

    const refreshIntegration = new apigateway.LambdaIntegration(refreshHandler);
    const refresh = api.root.addResource('refresh');
    refresh.addMethod('GET', refreshIntegration);
  }
}
