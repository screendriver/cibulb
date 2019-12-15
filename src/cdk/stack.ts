import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class CiBulbCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const colorHandler = new lambda.Function(this, 'ColorHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('target/lambda/'),
      handler: 'color.handler',
    });

    const refreshHandler = new lambda.Function(this, 'RefreshHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset('target/lambda/'),
      handler: 'refresh.handler',
    });

    const api = new apigateway.RestApi(this, 'CibulbApi');

    const colorIntegration = new apigateway.LambdaIntegration(colorHandler);
    const color = api.root.addResource('color');
    color.addMethod('POST', colorIntegration);

    const refreshIntegration = new apigateway.LambdaIntegration(refreshHandler);
    const refresh = api.root.addResource('refresh');
    refresh.addMethod('GET', refreshIntegration);
  }
}
