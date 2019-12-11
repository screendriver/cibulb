import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';

export class CiBulbCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda.Function(this, 'RefreshHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('target/src'),
      handler: 'refresh.handler',
    });
  }
}
