import { test } from 'mocha';
import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { CiBulbCdkStack } from '../../../src/cdk/stack';

suite('cdk stack', function() {
  test('color lambda content resource', function() {
    const app = new cdk.App();
    const stack = new CiBulbCdkStack(app, 'TestStack');
    expectCDK(stack).to(
      haveResource('AWS::Lambda::Function', {
        Runtime: 'nodejs12.x',
        Handler: 'color.handler',
      }),
    );
  });

  test('refresh lambda content resource', function() {
    const app = new cdk.App();
    const stack = new CiBulbCdkStack(app, 'TestStack');
    expectCDK(stack).to(
      haveResource('AWS::Lambda::Function', {
        Runtime: 'nodejs12.x',
        Handler: 'refresh.handler',
      }),
    );
  });

  test('API Gateway', function() {
    const app = new cdk.App();
    const stack = new CiBulbCdkStack(app, 'TestStack');
    expectCDK(stack).to(
      haveResource('AWS::ApiGateway::RestApi', {
        Name: 'CibulbApi',
      }),
    );
    expectCDK(stack).to(
      haveResource('AWS::ApiGateway::Resource', {
        PathPart: 'color',
      }),
    );
    expectCDK(stack).to(
      haveResource('AWS::ApiGateway::Method', {
        HttpMethod: 'POST',
        ResourceId: { Ref: 'CibulbApicolor26DDCF88' },
      }),
    );
    expectCDK(stack).to(
      haveResource('AWS::ApiGateway::Resource', {
        PathPart: 'refresh',
      }),
    );
    expectCDK(stack).to(
      haveResource('AWS::ApiGateway::Method', {
        HttpMethod: 'GET',
        ResourceId: { Ref: 'CibulbApirefresh43E9BCD5' },
      }),
    );
  });
});
