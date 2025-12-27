import {Duration} from "aws-cdk-lib";
import {Construct} from "constructs";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export interface CustomProps {
    handlerName: string;
    capability: string;
}
export class SectionsResources extends Construct {
    // Add the lambda as a property
    public readonly fnResource: lambda.Function;

    constructor(scope: Construct, id: string, props: CustomProps) {
        super(scope, id)
        // Create the Lambda function for sections API
        this.fnResource = new lambda.Function(scope, `${id}-lambda`, {
            runtime: lambda.Runtime.NODEJS_22_X,
            handler: `index.${props.handlerName}`,
            code: lambda.Code.fromAsset(path.join(__dirname, `../node_modules/@rinkkasatiainen/${props.capability}-functions/dist`)),
            environment: {
                NODE_ENV: 'production',
            },
            timeout: Duration.seconds(30),
            // Enable ES modules support
            architecture: lambda.Architecture.X86_64,
        });
    }
}