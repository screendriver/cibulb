#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CiBulbCdkStack } from './stack';

const app = new cdk.App();
new CiBulbCdkStack(app, 'CiBulbCdkStack', {
  env: {
    account: cdk.Aws.ACCOUNT_ID,
    region: process.env.AWS_DEFAULT_REGION,
  },
});
