import * as cdk from "aws-cdk-lib";
import {Duration} from "aws-cdk-lib";
import {Construct} from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

export interface CustomProps {
    handlerName: string;
    capability: string;
    userPoolId?: string;
    userPoolClientId?: string;
}
export class SectionsResources extends Construct {
    // Add the lambda as a property
    public readonly fnResource: lambda.Function;

    constructor(scope: Construct, id: string, props: CustomProps) {
        super(scope, id)
        // Create the Lambda function for sections API
        const environment: Record<string, string> = {
            NODE_ENV: 'production',
        };
        
        if (props.userPoolId) {
            environment.USER_POOL_ID = props.userPoolId;
        }
        
        if (props.userPoolClientId) {
            environment.USER_POOL_CLIENT_ID = props.userPoolClientId;
        }

        this.fnResource = new lambda.Function(scope, `${id}-lambda`, {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: `index.${props.handlerName}`,
            code: lambda.Code.fromAsset(path.join(__dirname, `../node_modules/@rinkkasatiainen/${props.capability}-functions/dist`)),
            environment,
            timeout: Duration.seconds(30),
            // Enable ES modules support
            architecture: lambda.Architecture.X86_64,
        });

        // Grant Lambda permission to verify Cognito tokens
        if (props.userPoolId) {
            const stack = cdk.Stack.of(scope);
            this.fnResource.addToRolePolicy(new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: [
                    'cognito-idp:GetUser',
                    'cognito-idp:AdminGetUser',
                ],
                resources: [`arn:aws:cognito-idp:${stack.region}:${stack.account}:userpool/${props.userPoolId}`],
            }));
        }
    }
}