#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CiBulbCdkStack } from './stack';

const app = new cdk.App();
new CiBulbCdkStack(app, 'CiBulbCdkStack', {
  env: {
    region: process.env.AWS_REGION,
    account: process.env.AWS_ACCOUNT_ID,
  },
});
