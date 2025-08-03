import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
export interface CodefreezeBoardStackProps extends cdk.StackProps {
    domainName?: string;
    hostedZoneId?: string;
}
export declare class CodefreezeBoardStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: CodefreezeBoardStackProps);
}
