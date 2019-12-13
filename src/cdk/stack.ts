import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';

export class CiBulbCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const refreshHandler = new lambda.Function(this, 'RefreshHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('target/src'),
      handler: 'refresh.handler',
    });

    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: refreshHandler,
    });
  }
}
