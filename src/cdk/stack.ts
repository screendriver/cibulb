import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Runtime, Function, Code } from '@aws-cdk/aws-lambda';
import { RestApi, LambdaIntegration } from '@aws-cdk/aws-apigateway';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Topic } from '@aws-cdk/aws-sns';
import { LambdaSubscription } from '@aws-cdk/aws-sns-subscriptions';

const lambdaRuntime = { runtime: Runtime.NODEJS_12_X };
const sentryDsn = { SENTRY_DSN: process.env.SENTRY_DSN ?? '' };
const dynamoDbTableName = { DYNAMODB_TABLE_NAME: 'Repositories' };
const dynamoDbPrimaryKey = { DYNAMODB_PRIMARY_KEY: 'Name' };
const topicArn = (arn: string) => ({ TOPIC_ARN: arn });

export class CiBulbCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const topic = new Topic(this, 'IftttTopic', {
      displayName: 'IFTTT Webhooks Topic',
    });

    const colorFunction = new Function(this, 'ColorFunction', {
      ...lambdaRuntime,
      code: Code.fromAsset('target/lambda/'),
      handler: 'color.handler',
      environment: {
        ...sentryDsn,
        ...dynamoDbTableName,
        ...dynamoDbPrimaryKey,
        ...topicArn(topic.topicArn),
        GITLAB_SECRET_TOKEN: process.env.GITLAB_SECRET_TOKEN ?? '',
      },
    });

    const refreshFunction = new Function(this, 'RefreshFunction', {
      ...lambdaRuntime,
      code: Code.fromAsset('target/lambda/'),
      handler: 'refresh.handler',
      environment: {
        ...sentryDsn,
        ...dynamoDbTableName,
        ...dynamoDbPrimaryKey,
        ...topicArn(topic.topicArn),
      },
    });

    const iftttFunction = new Function(this, 'IftttFunction', {
      ...lambdaRuntime,
      code: Code.fromAsset('target/lambda/'),
      handler: 'ifttt.handler',
      environment: {
        ...sentryDsn,
        IFTTT_BASE_URL: process.env.IFTTT_BASE_URL ?? '',
        IFTTT_KEY: process.env.IFTTT_KEY ?? '',
      },
    });

    const dynamoTable = new Table(this, 'RepositoriesTable', {
      partitionKey: {
        name: dynamoDbPrimaryKey.DYNAMODB_PRIMARY_KEY,
        type: AttributeType.STRING,
      },
      tableName: dynamoDbTableName.DYNAMODB_TABLE_NAME,
      readCapacity: 1,
      writeCapacity: 1,
    });
    dynamoTable.grantReadWriteData(colorFunction);
    dynamoTable.grantReadData(refreshFunction);

    topic.addSubscription(new LambdaSubscription(iftttFunction));
    topic.grantPublish(colorFunction);
    topic.grantPublish(refreshFunction);

    const api = new RestApi(this, 'CibulbApi');

    const colorIntegration = new LambdaIntegration(colorFunction);
    api.root.addResource('color').addMethod('POST', colorIntegration);

    const refreshIntegration = new LambdaIntegration(refreshFunction);
    api.root.addResource('refresh').addMethod('GET', refreshIntegration);
  }
}
