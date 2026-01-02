import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';
import {SectionsResources} from "./sections-resources.js";
import {CfbUserPool} from "./cognito-user-pool";
import {CacheCookieBehavior, CacheHeaderBehavior, CacheQueryStringBehavior} from "aws-cdk-lib/aws-cloudfront";

export interface CodefreezeBoardStackProps extends cdk.StackProps {
    domainName?: string;
    hostedZoneId?: string;
}

export class CodefreezeBoardStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: CodefreezeBoardStackProps) {
        super(scope, id, props);

        // S3 bucket for hosting the static website
        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            bucketName: `codefreeze-board-${this.account}-${this.region}`,

            /*
                  // accessControl: s3.BucketAccessControl.PRIVATE,
                  // websiteIndexDocument: 'index.html',
                  // websiteErrorDocument: 'index.html',
            */

            // publicReadAccess: false, // We'll use CloudFront for access
            // blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY, // For development - change for production
            autoDeleteObjects: true, // For development - change for production
        });

        // CloudFront Origin Access Identity
        const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity', {
            comment: 'OAI for CodeFreeze Board website',
        });

        // Grant read access to the S3 bucket for CloudFront
        websiteBucket.grantRead(originAccessIdentity);

        // Add bucket policy to ensure CloudFront can access the bucket
        websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [websiteBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId)],
        }));

        // Create API Gateway
        const api = new apigateway.RestApi(this, 'CodefreezeBoardApi', {
            restApiName: 'Codefreeze Board API',
            description: 'API for Codefreeze Board session discovery',
            defaultCorsPreflightOptions: {
                allowOrigins: apigateway.Cors.ALL_ORIGINS, // TODO: FIX when getting more real
                allowMethods: apigateway.Cors.ALL_METHODS,
                allowHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token'],
            },
        });

        const x = new CfbUserPool(this, 'CfbUserPool', {
            userPoolName: 'codefreeze-board-users',
        })

        // Create /api/event/{id} endpoint
        let eventResourcePath = api.root
            .addResource('api')
            .addResource('event')
            .addResource('{id}');

        const userPool = x.poolResource
        const userPoolClient = x.userPoolClient

        // Create Lambda function for sections API
        const sectionsLambda = new SectionsResources(this, 'SectionsLambda', {
            capability: "cfb-session-discovery",
            handlerName: "sectionsHandler",
            userPoolId: userPool.userPoolId,
            userPoolClientId: userPoolClient.userPoolClientId,
        })
        eventResourcePath
            .addResource('sections')
            .addMethod('GET', new apigateway.LambdaIntegration(sectionsLambda.fnResource));

        // Create Lambda function for sessions API
        const sessions = new SectionsResources(this, 'SessionsLambda', {
            capability: "cfb-session-discovery",
            handlerName: "sessionsHandler",
            userPoolId: userPool.userPoolId,
            userPoolClientId: userPoolClient.userPoolClientId,
        })
        eventResourcePath
            .addResource('sessions')
            .addMethod('GET', new apigateway.LambdaIntegration(sessions.fnResource));

        // Certificate and domain setup
        let certificate: acm.ICertificate | undefined;
        let hostedZone: route53.IHostedZone | undefined;
        let apiDomain: apigateway.DomainName | undefined;
        certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', "arn:aws:acm:us-east-1:094009463545:certificate/b4304a02-8a24-45b6-b704-31f00a08c197");

        if (!certificate && props?.domainName && props?.hostedZoneId) {
            // Import existing hosted zone
            hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                zoneName: props.domainName,
                hostedZoneId: props.hostedZoneId,
            });

            // Request certificate for the domain
            certificate = new acm.Certificate(this, 'Certificate', {
                domainName: props.domainName,
                subjectAlternativeNames: [`*.${props.domainName}`],
                validation: acm.CertificateValidation.fromDns(hostedZone),
            });
        }
        if (!certificate) {
            console.error('!!!!!No certificate provided!!!!!!', certificate, props?.domainName, props?.hostedZoneId);
            throw new Error('Either domainName and hostedZoneId must be provided or certificate must be provided');
            // require certificate
            return
        }

        // No need for custom API domain - we'll route through CloudFront

        // Custom cache policy with 1 second TTL for API
        const apiCachePolicy = new cloudfront.CachePolicy(this, 'ApiCachePolicy', {
            cachePolicyName: 'CodefreezeBoardApiCache',
            headerBehavior: CacheHeaderBehavior.allowList('Authorization', 'Origin', 'Referer'),
            queryStringBehavior: CacheQueryStringBehavior.all(),
            cookieBehavior: CacheCookieBehavior.none(),
            minTtl: cdk.Duration.seconds(0),
            maxTtl: cdk.Duration.seconds(1),
            defaultTtl: cdk.Duration.seconds(1),
            enableAcceptEncodingGzip: true,
            enableAcceptEncodingBrotli: true,
        });

        // Custom origin request policy to forward Authorization, Origin, and Referer headers
        const apiOriginRequestPolicy = new cloudfront.OriginRequestPolicy(this, 'ApiOriginRequestPolicy', {
            originRequestPolicyName: 'CodefreezeBoardApiOriginRequest',
            headerBehavior: cloudfront.OriginRequestHeaderBehavior.none(),
            queryStringBehavior: cloudfront.OriginRequestQueryStringBehavior.all(),
            cookieBehavior: cloudfront.OriginRequestCookieBehavior.none(),
        });

        // CloudFront distribution with API routing
        const distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: origins.S3BucketOrigin.withOriginAccessControl(websiteBucket),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'MainResponseHeadersPolicy', {
                    responseHeadersPolicyName: 'CodefreezeBoardMainHeaders',
                    comment: 'Headers for CodeFreeze Board main content',
                    securityHeadersBehavior: {
                        contentTypeOptions: {override: true},
                        frameOptions: {frameOption: cloudfront.HeadersFrameOption.DENY, override: true},
                        referrerPolicy: {
                            referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                            override: true
                        },
                        strictTransportSecurity: {
                            accessControlMaxAge: cdk.Duration.seconds(31536000),
                            includeSubdomains: true,
                            override: true
                        },
                        xssProtection: {protection: true, modeBlock: true, override: true},
                    },
                }),
            },
            additionalBehaviors: {
                '/api/*': {
                    origin: new origins.RestApiOrigin(api),
                    viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                    cachePolicy: apiCachePolicy, // 1 second caching, Forward Authorization, Origin, Referer
                    originRequestPolicy: apiOriginRequestPolicy,
                    allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                    responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'ApiResponseHeadersPolicy', {
                        responseHeadersPolicyName: 'CodefreezeBoardApiHeaders',
                        comment: 'Headers for CodeFreeze Board API - passes through CORS from API Gateway',
                        // No corsBehavior - let API Gateway CORS headers pass through
                        // No custom CORS headers - let origin handle CORS
                        securityHeadersBehavior: {
                            contentTypeOptions: {override: true},
                            frameOptions: {frameOption: cloudfront.HeadersFrameOption.DENY, override: true},
                            referrerPolicy: {
                                referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
                                override: true
                            },
                            strictTransportSecurity: {
                                accessControlMaxAge: cdk.Duration.seconds(31536000),
                                includeSubdomains: true,
                                override: true
                            },
                        },
                    }),
                },
            },
            defaultRootObject: 'index.html',
            domainNames: certificate ? [props!.domainName!] : undefined,
            certificate: certificate,
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                    ttl: cdk.Duration.seconds(0),
                },
            ],
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
        });

        // Deploy the UI files to S3
        new s3deploy.BucketDeployment(this, 'CfbWebsite', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../build/dist'))],
            destinationBucket: websiteBucket,
            distribution,
            distributionPaths: ['/*'],
        });

        // Create Route53 A record if domain is provided
        if (hostedZone && certificate) {
            new route53.ARecord(this, 'AliasRecord', {
                zone: hostedZone,
                target: route53.RecordTarget.fromAlias(
                    new targets.CloudFrontTarget(distribution)
                ),
                recordName: props!.domainName,
            });
        } else {
            console.warn('******');
            console.warn('******');
            console.warn('No Route53 hosted zone or certificate provided - skipping Route53 record creation');
            console.warn('******');
            console.warn('******');
        }

        // Output the CloudFront URL
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
            description: 'CloudFront Distribution Domain Name',
        });

        new cdk.CfnOutput(this, 'WebsiteURL', {
            value: certificate ? `https://${props!.domainName}` : `https://${distribution.distributionDomainName}`,
            description: 'Website URL',
        });

        if (certificate) {
            new cdk.CfnOutput(this, 'CustomDomainURL', {
                value: `https://${props!.domainName}`,
                description: 'Custom Domain URL',
            });
        }

        // Output the S3 bucket name for debugging
        new cdk.CfnOutput(this, 'WebsiteBucketName', {
            value: websiteBucket.bucketName,
            description: 'S3 Bucket Name',
        });

        // Output the CloudFront distribution ID for debugging
        new cdk.CfnOutput(this, 'DistributionId', {
            value: distribution.distributionId,
            description: 'CloudFront Distribution ID',
        });

        // Output the API Gateway URL
        new cdk.CfnOutput(this, 'ApiGatewayUrl', {
            value: api.url,
            description: 'API Gateway URL',
        });

        // Output the sections API endpoint
        new cdk.CfnOutput(this, 'SectionsApiEndpoint', {
            value: `${api.url}api/sections`,
            description: 'Sections API Endpoint (Direct API Gateway)',
        });

        // Output the CloudFront API endpoint
        new cdk.CfnOutput(this, 'CloudFrontApiEndpoint', {
            value: certificate ? `https://${props!.domainName}/api/sections` : `https://${distribution.distributionDomainName}/api/sections`,
            description: 'Sections API Endpoint (via CloudFront)',
        });

        // Output Cognito User Pool information
        new cdk.CfnOutput(this, 'UserPoolId', {
            value: userPool.userPoolId,
            description: 'Cognito User Pool ID',
        });

        new cdk.CfnOutput(this, 'UserPoolClientId', {
            value: userPoolClient.userPoolClientId,
            description: 'Cognito User Pool Client ID',
        });
    }
} 