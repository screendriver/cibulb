import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { Runtime, Function, Code } from '@aws-cdk/aws-lambda';
import { SqsEventSource } from '@aws-cdk/aws-lambda-event-sources';
import {
  RestApi,
  LambdaIntegration,
  DomainName,
} from '@aws-cdk/aws-apigateway';
import { Certificate } from '@aws-cdk/aws-certificatemanager';
import { Table, AttributeType } from '@aws-cdk/aws-dynamodb';
import { Queue } from '@aws-cdk/aws-sqs';
import {
  Dashboard,
  GraphWidget,
  SingleValueWidget,
} from '@aws-cdk/aws-cloudwatch';

const lambdaRuntime = { runtime: Runtime.NODEJS_12_X };
const sentryDsn = { SENTRY_DSN: process.env.SENTRY_DSN ?? '' };
const dynamoDbTableName = { DYNAMODB_TABLE_NAME: 'Repositories' };
const queueUrl = (url: string) => ({ QUEUE_URL: url });

export class CiBulbCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const queue = new Queue(this, 'Queue', {
      fifo: true,
      contentBasedDeduplication: true,
    });

    const dynamoTable = new Table(this, 'RepositoriesTable', {
      partitionKey: {
        name: 'Name',
        type: AttributeType.STRING,
      },
      tableName: dynamoDbTableName.DYNAMODB_TABLE_NAME,
      readCapacity: 1,
      writeCapacity: 1,
    });

    const colorFunction = new Function(this, 'ColorFunction', {
      ...lambdaRuntime,
      code: Code.fromAsset('target/lambda/'),
      handler: 'color.handler',
      environment: {
        ...sentryDsn,
        ...dynamoDbTableName,
        ...queueUrl(queue.queueUrl),
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
        ...queueUrl(queue.queueUrl),
      },
    });

    const iftttFunction = new Function(this, 'IftttFunction', {
      ...lambdaRuntime,
      code: Code.fromAsset('target/lambda/'),
      handler: 'ifttt.handler',
      environment: {
        ...sentryDsn,
        ...dynamoDbTableName,
        IFTTT_BASE_URL: process.env.IFTTT_BASE_URL ?? '',
        IFTTT_KEY: process.env.IFTTT_KEY ?? '',
      },
      events: [new SqsEventSource(queue)],
    });

    dynamoTable.grantWriteData(colorFunction);
    dynamoTable.grantReadData(iftttFunction);

    queue.grantSendMessages(colorFunction);
    queue.grantSendMessages(refreshFunction);
    queue.grantConsumeMessages(iftttFunction);

    const certificate = Certificate.fromCertificateArn(
      this,
      'Certificate',
      process.env.AWS_CERTIFICATE_ARN ?? '',
    );

    const domainName = {
      domainName: process.env.AWS_API_DOMAIN_NAME ?? '',
      certificate,
    };

    const api = new RestApi(this, 'CibulbApi');

    const domain = new DomainName(this, 'CiBulbDomainName', domainName);
    domain.addBasePathMapping(api, { basePath: 'cibulb' });

    const colorIntegration = new LambdaIntegration(colorFunction);
    api.root.addResource('color').addMethod('POST', colorIntegration);

    const refreshIntegration = new LambdaIntegration(refreshFunction);
    api.root.addResource('refresh').addMethod('GET', refreshIntegration);

    const dashboard = new Dashboard(this, 'Dashboard', {
      dashboardName: 'CiBulb',
    });
    dashboard.addWidgets(
      new SingleValueWidget({
        title: 'Lambda invocations',
        width: 14,
        setPeriodToTimeRange: true,
        metrics: [
          colorFunction.metricInvocations({ statistic: 'Sum' }),
          refreshFunction.metricInvocations({ statistic: 'Sum' }),
          iftttFunction.metricInvocations({ statistic: 'Sum' }),
        ],
      }),
      new GraphWidget({
        title: 'Messages received',
        width: 10,
        left: [
          queue.metricNumberOfMessagesReceived({
            statistic: 'Sum',
          }),
        ],
      }),
    );
  }
}
