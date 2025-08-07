import * as cdk from 'aws-cdk-lib';
import * as amplify from "aws-cdk-lib/aws-amplify";
import { Construct } from 'constructs';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface CfbAmplifyStackProps extends cdk.StackProps {
  githubRepo: string;
  githubBranch: string;
  domainName: string;
}

export class CfbAmplifyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CfbAmplifyStackProps) {
    super(scope, id, props);

    // Create Amplify app using CloudFormation constructs
    const amplifyApp = new cdk.aws_amplify.CfnApp(this, 'CfbAmplifyApp', {
      name: 'codefreeze-board-amplify',
      repository: props.githubRepo,
      accessToken: cdk.SecretValue.secretsManager('github-token').toString(),
      buildSpec: `
version: 0.2
frontend:
  phases:
    preBuild:
      commands:
        - cd ui
        - npm config set @rinkkasatiainen:registry https://npm.pkg.github.com
        - npm config set //npm.pkg.github.com/:_authToken=$NPM_AUTH_TOKEN    
        - yarn install --production
    build:
      commands:
        - ./build.sh
  artifacts:
    baseDirectory: ui/build/dist
    files:
      - '**/*'
  # cache:
    # paths:
      # - ui/node_modules/**/*
      `,
      // customRules: [
      //   {
      //     source: '/<*>',
      //     target: '/index.html',
      //     status: '200',
      //   },
      // ],
    });

    // Create main branch
    const mainBranch = new cdk.aws_amplify.CfnBranch(this, 'MainBranch', {
      appId: amplifyApp.attrAppId,
      branchName: props.githubBranch,
      enableAutoBuild: true,
      environmentVariables: [
        {
          name: 'NODE_ENV',
          value: 'production',
        },
      ],
    });
    //
    const domain = new cdk.aws_amplify.CfnDomain(this, 'Domain', {
      appId: amplifyApp.attrAppId,
      domainName: props.domainName,
      subDomainSettings: [{
        branchName: props.githubBranch,
        prefix: "demo",
      }],
    })

    // Outputs
    new cdk.CfnOutput(this, 'AmplifyAppId', {
      value: amplifyApp.attrAppId,
      description: 'Amplify App ID',
    });

    new cdk.CfnOutput(this, 'AmplifyAppUrl', {
      value: `https://${props.githubBranch}.${amplifyApp.ref}.amplifyapp.com`,
      description: 'Amplify App URL',
    });

    // Custom domain will be configured through Amplify console
    new cdk.CfnOutput(this, 'AmplifyConsoleUrl', {
      value: `https://console.aws.amazon.com/amplify/home?region=${this.region}#/${amplifyApp.ref}`,
      description: 'Amplify Console URL',
    });
  }
} 