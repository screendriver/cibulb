import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class CiBulbCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const colorHandler = new lambda.Function(this, 'ColorHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('target'),
      handler: 'color-bundle.handler',
    });

    const refreshHandler = new lambda.Function(this, 'RefreshHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('target'),
      handler: 'refresh-bundle.handler',
    });

    const api = new apigateway.LambdaRestApi(this, 'CibulbApi', {
      handler: colorHandler,
      proxy: false,
    });

    const colorIntegration = new apigateway.LambdaIntegration(colorHandler);
    const color = api.root.addResource('color');
    color.addMethod('POST', colorIntegration);

    const refreshIntegration = new apigateway.LambdaIntegration(refreshHandler);
    const refresh = api.root.addResource('refresh');
    refresh.addMethod('GET', refreshIntegration);
  }
}
