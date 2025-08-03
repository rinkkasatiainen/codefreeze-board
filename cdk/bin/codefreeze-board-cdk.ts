#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CodefreezeBoardStack } from '../lib/codefreeze-board-stack';

const app = new cdk.App();

// Get domain configuration from context or environment
const domainName = app.node.tryGetContext('domainName') || process.env.DOMAIN_NAME;
const hostedZoneId = app.node.tryGetContext('hostedZoneId') || process.env.HOSTED_ZONE_ID;

new CodefreezeBoardStack(app, 'CodefreezeBoardStack', {
  stackName: 'codefreeze-board',
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  domainName,
  hostedZoneId,
}); 