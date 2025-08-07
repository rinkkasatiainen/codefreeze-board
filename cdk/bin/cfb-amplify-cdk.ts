#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CfbAmplifyStack } from '../lib/cfb-amplify-stack';

const app = new cdk.App();

// Get configuration from context or environment
const domainName = app.node.tryGetContext('domainName') || process.env.DOMAIN_NAME || 'rinkkasatiainen.dev';
const hostedZoneId = app.node.tryGetContext('hostedZoneId') || process.env.HOSTED_ZONE_ID;
const githubRepo = app.node.tryGetContext('githubRepo') || process.env.GITHUB_REPO || 'https://github.com/rinkkasatiainen/codefreeze-board.git';
const githubBranch = app.node.tryGetContext('githubBranch') || process.env.GITHUB_BRANCH || 'main';

if(!domainName || !hostedZoneId || !githubRepo){
  throw new Error('Domain name, hosted zone id and github repo must be provided as context or environment variables')
}

new CfbAmplifyStack(app, 'CfbAmplifyStack', {
  stackName: 'cfb-amplify',
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  githubRepo,
  githubBranch,
  domainName
}); 