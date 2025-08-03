"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodefreezeBoardStack = void 0;
const cdk = require("aws-cdk-lib");
const s3 = require("aws-cdk-lib/aws-s3");
const s3deploy = require("aws-cdk-lib/aws-s3-deployment");
const cloudfront = require("aws-cdk-lib/aws-cloudfront");
const origins = require("aws-cdk-lib/aws-cloudfront-origins");
const iam = require("aws-cdk-lib/aws-iam");
const acm = require("aws-cdk-lib/aws-certificatemanager");
const route53 = require("aws-cdk-lib/aws-route53");
const targets = require("aws-cdk-lib/aws-route53-targets");
const path = require("path");
class CodefreezeBoardStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // S3 bucket for hosting the static website
        const websiteBucket = new s3.Bucket(this, 'WebsiteBucket', {
            bucketName: `codefreeze-board-${this.account}-${this.region}`,
            publicReadAccess: false,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
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
        // Certificate and domain setup
        let certificate;
        let hostedZone;
        if (props?.domainName && props?.hostedZoneId) {
            // Import existing hosted zone
            hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
                zoneName: props.domainName,
                hostedZoneId: props.hostedZoneId,
            });
            certificate = acm.Certificate.fromCertificateArn(this, 'Certificate', "arn:aws:acm:us-east-1:094009463545:certificate/b4304a02-8a24-45b6-b704-31f00a08c197");
            // Request certificate for the domain
            // certificate = new acm.Certificate(this, 'Certificate', {
            //   domainName: props.domainName,
            //   subjectAlternativeNames: [`*.${props.domainName}`],
            //   validation: acm.CertificateValidation.fromDns(hostedZone),
            // });
        }
        if (!certificate) {
            // require certificate
            return;
        }
        // CloudFront distribution
        const distribution = new cloudfront.Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(websiteBucket, {
                    originAccessIdentity,
                }),
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
                responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
                    responseHeadersPolicyName: 'CodefreezeBoardHeaders',
                    comment: 'Headers for CodeFreeze Board',
                    securityHeadersBehavior: {
                        contentTypeOptions: { override: true },
                        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
                        referrerPolicy: { referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN, override: true },
                        strictTransportSecurity: { accessControlMaxAge: cdk.Duration.seconds(31536000), includeSubdomains: true, override: true },
                        xssProtection: { protection: true, modeBlock: true, override: true },
                    },
                }),
            },
            defaultRootObject: 'index.html',
            domainNames: certificate ? [props.domainName] : undefined,
            certificate: certificate,
            errorResponses: [
                {
                    httpStatus: 404,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
                {
                    httpStatus: 403,
                    responseHttpStatus: 200,
                    responsePagePath: '/index.html',
                },
            ],
            priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // Use only North America and Europe
        });
        // Deploy the UI files to S3
        new s3deploy.BucketDeployment(this, 'DeployWebsite', {
            sources: [s3deploy.Source.asset(path.join(__dirname, '../../build/dist'))],
            destinationBucket: websiteBucket,
            distribution,
            distributionPaths: ['/*'],
        });
        // Create Route53 A record if domain is provided
        if (hostedZone && certificate) {
            new route53.ARecord(this, 'AliasRecord', {
                zone: hostedZone,
                target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
                recordName: props.domainName,
            });
        }
        // Output the CloudFront URL
        new cdk.CfnOutput(this, 'DistributionDomainName', {
            value: distribution.distributionDomainName,
            description: 'CloudFront Distribution Domain Name',
        });
        new cdk.CfnOutput(this, 'WebsiteURL', {
            value: certificate ? `https://${props.domainName}` : `https://${distribution.distributionDomainName}`,
            description: 'Website URL',
        });
        if (certificate) {
            new cdk.CfnOutput(this, 'CustomDomainURL', {
                value: `https://${props.domainName}`,
                description: 'Custom Domain URL',
            });
        }
    }
}
exports.CodefreezeBoardStack = CodefreezeBoardStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29kZWZyZWV6ZS1ib2FyZC1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvZGVmcmVlemUtYm9hcmQtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBRW5DLHlDQUF5QztBQUN6QywwREFBMEQ7QUFDMUQseURBQXlEO0FBQ3pELDhEQUE4RDtBQUM5RCwyQ0FBMkM7QUFDM0MsMERBQTBEO0FBQzFELG1EQUFtRDtBQUNuRCwyREFBMkQ7QUFDM0QsNkJBQTZCO0FBTzdCLE1BQWEsb0JBQXFCLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDakQsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUFpQztRQUN6RSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4QiwyQ0FBMkM7UUFDM0MsTUFBTSxhQUFhLEdBQUcsSUFBSSxFQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDekQsVUFBVSxFQUFFLG9CQUFvQixJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDN0QsZ0JBQWdCLEVBQUUsS0FBSztZQUN2QixpQkFBaUIsRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsU0FBUztZQUNqRCxhQUFhLEVBQUUsR0FBRyxDQUFDLGFBQWEsQ0FBQyxPQUFPO1lBQ3hDLGlCQUFpQixFQUFFLElBQUksRUFBRSwwQ0FBMEM7U0FDcEUsQ0FBQyxDQUFDO1FBRUgsb0NBQW9DO1FBQ3BDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxVQUFVLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLHNCQUFzQixFQUFFO1lBQzdGLE9BQU8sRUFBRSxrQ0FBa0M7U0FDNUMsQ0FBQyxDQUFDO1FBRUgsb0RBQW9EO1FBQ3BELGFBQWEsQ0FBQyxTQUFTLENBQUMsb0JBQW9CLENBQUMsQ0FBQztRQUU5QywrREFBK0Q7UUFDL0QsYUFBYSxDQUFDLG1CQUFt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WSxDQUFDLHNCQUFzQixFQUFFO1lBQ3RHLFdBQVcsRUFBRSxhQUFhO1NBQzNCLENBQUMsQ0FBQztRQUVILElBQUksV0FBVyxFQUFFO1lBQ2YsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtnQkFDekMsS0FBSyxFQUFFLFdBQVcsS0FBTSxDQUFDLFVBQVUsRUFBRTtnQkFDckMsV0FBVyxFQUFFLG1CQUFtQjthQUNqQyxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7Q0FDRjtBQS9IRCxvREErSEMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBzMyBmcm9tICdhd3MtY2RrLWxpYi9hd3MtczMnO1xuaW1wb3J0ICogYXMgczNkZXBsb3kgZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzLWRlcGxveW1lbnQnO1xuaW1wb3J0ICogYXMgY2xvdWRmcm9udCBmcm9tICdhd3MtY2RrLWxpYi9hd3MtY2xvdWRmcm9udCc7XG5pbXBvcnQgKiBhcyBvcmlnaW5zIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250LW9yaWdpbnMnO1xuaW1wb3J0ICogYXMgaWFtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuaW1wb3J0ICogYXMgYWNtIGZyb20gJ2F3cy1jZGstbGliL2F3cy1jZXJ0aWZpY2F0ZW1hbmFnZXInO1xuaW1wb3J0ICogYXMgcm91dGU1MyBmcm9tICdhd3MtY2RrLWxpYi9hd3Mtcm91dGU1Myc7XG5pbXBvcnQgKiBhcyB0YXJnZXRzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1yb3V0ZTUzLXRhcmdldHMnO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGludGVyZmFjZSBDb2RlZnJlZXplQm9hcmRTdGFja1Byb3BzIGV4dGVuZHMgY2RrLlN0YWNrUHJvcHMge1xuICBkb21haW5OYW1lPzogc3RyaW5nO1xuICBob3N0ZWRab25lSWQ/OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBDb2RlZnJlZXplQm9hcmRTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogQ29kZWZyZWV6ZUJvYXJkU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gUzMgYnVja2V0IGZvciBob3N0aW5nIHRoZSBzdGF0aWMgd2Vic2l0ZVxuICAgIGNvbnN0IHdlYnNpdGVCdWNrZXQgPSBuZXcgczMuQnVja2V0KHRoaXMsICdXZWJzaXRlQnVja2V0Jywge1xuICAgICAgYnVja2V0TmFtZTogYGNvZGVmcmVlemUtYm9hcmQtJHt0aGlzLmFjY291bnR9LSR7dGhpcy5yZWdpb259YCxcbiAgICAgIHB1YmxpY1JlYWRBY2Nlc3M6IGZhbHNlLCAvLyBXZSdsbCB1c2UgQ2xvdWRGcm9udCBmb3IgYWNjZXNzXG4gICAgICBibG9ja1B1YmxpY0FjY2VzczogczMuQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuICAgICAgcmVtb3ZhbFBvbGljeTogY2RrLlJlbW92YWxQb2xpY3kuREVTVFJPWSwgLy8gRm9yIGRldmVsb3BtZW50IC0gY2hhbmdlIGZvciBwcm9kdWN0aW9uXG4gICAgICBhdXRvRGVsZXRlT2JqZWN0czogdHJ1ZSwgLy8gRm9yIGRldmVsb3BtZW50IC0gY2hhbmdlIGZvciBwcm9kdWN0aW9uXG4gICAgfSk7XG5cbiAgICAvLyBDbG91ZEZyb250IE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHlcbiAgICBjb25zdCBvcmlnaW5BY2Nlc3NJZGVudGl0eSA9IG5ldyBjbG91ZGZyb250Lk9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdPcmlnaW5BY2Nlc3NJZGVudGl0eScsIHtcbiAgICAgIGNvbW1lbnQ6ICdPQUkgZm9yIENvZGVGcmVlemUgQm9hcmQgd2Vic2l0ZScsXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCByZWFkIGFjY2VzcyB0byB0aGUgUzMgYnVja2V0IGZvciBDbG91ZEZyb250XG4gICAgd2Vic2l0ZUJ1Y2tldC5ncmFudFJlYWQob3JpZ2luQWNjZXNzSWRlbnRpdHkpO1xuXG4gICAgLy8gQWRkIGJ1Y2tldCBwb2xpY3kgdG8gZW5zdXJlIENsb3VkRnJvbnQgY2FuIGFjY2VzcyB0aGUgYnVja2V0XG4gICAgd2Vic2l0ZUJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGFjdGlvbnM6IFsnczM6R2V0T2JqZWN0J10sXG4gICAgICByZXNvdXJjZXM6IFt3ZWJzaXRlQnVja2V0LmFybkZvck9iamVjdHMoJyonKV0sXG4gICAgICBwcmluY2lwYWxzOiBbbmV3IGlhbS5DYW5vbmljYWxVc2VyUHJpbmNpcGFsKG9yaWdpbkFjY2Vzc0lkZW50aXR5LmNsb3VkRnJvbnRPcmlnaW5BY2Nlc3NJZGVudGl0eVMzQ2Fub25pY2FsVXNlcklkKV0sXG4gICAgfSkpO1xuXG4gICAgLy8gQ2VydGlmaWNhdGUgYW5kIGRvbWFpbiBzZXR1cFxuICAgIGxldCBjZXJ0aWZpY2F0ZTogYWNtLklDZXJ0aWZpY2F0ZSB8IHVuZGVmaW5lZDtcbiAgICBsZXQgaG9zdGVkWm9uZTogcm91dGU1My5JSG9zdGVkWm9uZSB8IHVuZGVmaW5lZDtcbiAgICBcbiAgICBpZiAocHJvcHM/LmRvbWFpbk5hbWUgJiYgcHJvcHM/Lmhvc3RlZFpvbmVJZCkge1xuICAgICAgLy8gSW1wb3J0IGV4aXN0aW5nIGhvc3RlZCB6b25lXG4gICAgICBob3N0ZWRab25lID0gcm91dGU1My5Ib3N0ZWRab25lLmZyb21Ib3N0ZWRab25lQXR0cmlidXRlcyh0aGlzLCAnSG9zdGVkWm9uZScsIHtcbiAgICAgICAgem9uZU5hbWU6IHByb3BzLmRvbWFpbk5hbWUsXG4gICAgICAgIGhvc3RlZFpvbmVJZDogcHJvcHMuaG9zdGVkWm9uZUlkLFxuICAgICAgfSk7XG5cbiAgICAgIGNlcnRpZmljYXRlID0gYWNtLkNlcnRpZmljYXRlLmZyb21DZXJ0aWZpY2F0ZUFybih0aGlzLCAnQ2VydGlmaWNhdGUnLCBcImFybjphd3M6YWNtOnVzLWVhc3QtMTowOTQwMDk0NjM1NDU6Y2VydGlmaWNhdGUvYjQzMDRhMDItOGEyNC00NWI2LWI3MDQtMzFmMDBhMDhjMTk3XCIpO1xuICAgICAgLy8gUmVxdWVzdCBjZXJ0aWZpY2F0ZSBmb3IgdGhlIGRvbWFpblxuICAgICAgLy8gY2VydGlmaWNhdGUgPSBuZXcgYWNtLkNlcnRpZmljYXRlKHRoaXMsICdDZXJ0aWZpY2F0ZScsIHtcbiAgICAgIC8vICAgZG9tYWluTmFtZTogcHJvcHMuZG9tYWluTmFtZSxcbiAgICAgIC8vICAgc3ViamVjdEFsdGVybmF0aXZlTmFtZXM6IFtgKi4ke3Byb3BzLmRvbWFpbk5hbWV9YF0sXG4gICAgICAvLyAgIHZhbGlkYXRpb246IGFjbS5DZXJ0aWZpY2F0ZVZhbGlkYXRpb24uZnJvbURucyhob3N0ZWRab25lKSxcbiAgICAgIC8vIH0pO1xuICAgIH1cblxuICAgIGlmICghY2VydGlmaWNhdGUpIHtcbiAgICAgIC8vIHJlcXVpcmUgY2VydGlmaWNhdGVcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICAvLyBDbG91ZEZyb250IGRpc3RyaWJ1dGlvblxuICAgIGNvbnN0IGRpc3RyaWJ1dGlvbiA9IG5ldyBjbG91ZGZyb250LkRpc3RyaWJ1dGlvbih0aGlzLCAnRGlzdHJpYnV0aW9uJywge1xuICAgICAgZGVmYXVsdEJlaGF2aW9yOiB7XG4gICAgICAgIG9yaWdpbjogbmV3IG9yaWdpbnMuUzNPcmlnaW4od2Vic2l0ZUJ1Y2tldCwge1xuICAgICAgICAgIG9yaWdpbkFjY2Vzc0lkZW50aXR5LFxuICAgICAgICB9KSxcbiAgICAgICAgdmlld2VyUHJvdG9jb2xQb2xpY3k6IGNsb3VkZnJvbnQuVmlld2VyUHJvdG9jb2xQb2xpY3kuUkVESVJFQ1RfVE9fSFRUUFMsXG4gICAgICAgIGNhY2hlUG9saWN5OiBjbG91ZGZyb250LkNhY2hlUG9saWN5LkNBQ0hJTkdfT1BUSU1JWkVELFxuICAgICAgICByZXNwb25zZUhlYWRlcnNQb2xpY3k6IG5ldyBjbG91ZGZyb250LlJlc3BvbnNlSGVhZGVyc1BvbGljeSh0aGlzLCAnUmVzcG9uc2VIZWFkZXJzUG9saWN5Jywge1xuICAgICAgICAgIHJlc3BvbnNlSGVhZGVyc1BvbGljeU5hbWU6ICdDb2RlZnJlZXplQm9hcmRIZWFkZXJzJyxcbiAgICAgICAgICBjb21tZW50OiAnSGVhZGVycyBmb3IgQ29kZUZyZWV6ZSBCb2FyZCcsXG4gICAgICAgICAgc2VjdXJpdHlIZWFkZXJzQmVoYXZpb3I6IHtcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlT3B0aW9uczogeyBvdmVycmlkZTogdHJ1ZSB9LFxuICAgICAgICAgICAgZnJhbWVPcHRpb25zOiB7IGZyYW1lT3B0aW9uOiBjbG91ZGZyb250LkhlYWRlcnNGcmFtZU9wdGlvbi5ERU5ZLCBvdmVycmlkZTogdHJ1ZSB9LFxuICAgICAgICAgICAgcmVmZXJyZXJQb2xpY3k6IHsgcmVmZXJyZXJQb2xpY3k6IGNsb3VkZnJvbnQuSGVhZGVyc1JlZmVycmVyUG9saWN5LlNUUklDVF9PUklHSU5fV0hFTl9DUk9TU19PUklHSU4sIG92ZXJyaWRlOiB0cnVlIH0sXG4gICAgICAgICAgICBzdHJpY3RUcmFuc3BvcnRTZWN1cml0eTogeyBhY2Nlc3NDb250cm9sTWF4QWdlOiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMTUzNjAwMCksIGluY2x1ZGVTdWJkb21haW5zOiB0cnVlLCBvdmVycmlkZTogdHJ1ZSB9LFxuICAgICAgICAgICAgeHNzUHJvdGVjdGlvbjogeyBwcm90ZWN0aW9uOiB0cnVlLCBtb2RlQmxvY2s6IHRydWUsIG92ZXJyaWRlOiB0cnVlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgICAgZGVmYXVsdFJvb3RPYmplY3Q6ICdpbmRleC5odG1sJyxcbiAgICAgIGRvbWFpbk5hbWVzOiBjZXJ0aWZpY2F0ZSA/IFtwcm9wcyEuZG9tYWluTmFtZSFdIDogdW5kZWZpbmVkLFxuICAgICAgY2VydGlmaWNhdGU6IGNlcnRpZmljYXRlLFxuICAgICAgZXJyb3JSZXNwb25zZXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIGh0dHBTdGF0dXM6IDQwNCxcbiAgICAgICAgICByZXNwb25zZUh0dHBTdGF0dXM6IDIwMCxcbiAgICAgICAgICByZXNwb25zZVBhZ2VQYXRoOiAnL2luZGV4Lmh0bWwnLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaHR0cFN0YXR1czogNDAzLFxuICAgICAgICAgIHJlc3BvbnNlSHR0cFN0YXR1czogMjAwLFxuICAgICAgICAgIHJlc3BvbnNlUGFnZVBhdGg6ICcvaW5kZXguaHRtbCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgcHJpY2VDbGFzczogY2xvdWRmcm9udC5QcmljZUNsYXNzLlBSSUNFX0NMQVNTXzEwMCwgLy8gVXNlIG9ubHkgTm9ydGggQW1lcmljYSBhbmQgRXVyb3BlXG4gICAgfSk7XG5cbiAgICAvLyBEZXBsb3kgdGhlIFVJIGZpbGVzIHRvIFMzXG4gICAgbmV3IHMzZGVwbG95LkJ1Y2tldERlcGxveW1lbnQodGhpcywgJ0RlcGxveVdlYnNpdGUnLCB7XG4gICAgICBzb3VyY2VzOiBbczNkZXBsb3kuU291cmNlLmFzc2V0KHBhdGguam9pbihfX2Rpcm5hbWUsICcuLi8uLi9idWlsZC9kaXN0JykpXSxcbiAgICAgIGRlc3RpbmF0aW9uQnVja2V0OiB3ZWJzaXRlQnVja2V0LFxuICAgICAgZGlzdHJpYnV0aW9uLFxuICAgICAgZGlzdHJpYnV0aW9uUGF0aHM6IFsnLyonXSxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBSb3V0ZTUzIEEgcmVjb3JkIGlmIGRvbWFpbiBpcyBwcm92aWRlZFxuICAgIGlmIChob3N0ZWRab25lICYmIGNlcnRpZmljYXRlKSB7XG4gICAgICBuZXcgcm91dGU1My5BUmVjb3JkKHRoaXMsICdBbGlhc1JlY29yZCcsIHtcbiAgICAgICAgem9uZTogaG9zdGVkWm9uZSxcbiAgICAgICAgdGFyZ2V0OiByb3V0ZTUzLlJlY29yZFRhcmdldC5mcm9tQWxpYXMoXG4gICAgICAgICAgbmV3IHRhcmdldHMuQ2xvdWRGcm9udFRhcmdldChkaXN0cmlidXRpb24pXG4gICAgICAgICksXG4gICAgICAgIHJlY29yZE5hbWU6IHByb3BzIS5kb21haW5OYW1lLFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gT3V0cHV0IHRoZSBDbG91ZEZyb250IFVSTFxuICAgIG5ldyBjZGsuQ2ZuT3V0cHV0KHRoaXMsICdEaXN0cmlidXRpb25Eb21haW5OYW1lJywge1xuICAgICAgdmFsdWU6IGRpc3RyaWJ1dGlvbi5kaXN0cmlidXRpb25Eb21haW5OYW1lLFxuICAgICAgZGVzY3JpcHRpb246ICdDbG91ZEZyb250IERpc3RyaWJ1dGlvbiBEb21haW4gTmFtZScsXG4gICAgfSk7XG5cbiAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnV2Vic2l0ZVVSTCcsIHtcbiAgICAgIHZhbHVlOiBjZXJ0aWZpY2F0ZSA/IGBodHRwczovLyR7cHJvcHMhLmRvbWFpbk5hbWV9YCA6IGBodHRwczovLyR7ZGlzdHJpYnV0aW9uLmRpc3RyaWJ1dGlvbkRvbWFpbk5hbWV9YCxcbiAgICAgIGRlc2NyaXB0aW9uOiAnV2Vic2l0ZSBVUkwnLFxuICAgIH0pO1xuXG4gICAgaWYgKGNlcnRpZmljYXRlKSB7XG4gICAgICBuZXcgY2RrLkNmbk91dHB1dCh0aGlzLCAnQ3VzdG9tRG9tYWluVVJMJywge1xuICAgICAgICB2YWx1ZTogYGh0dHBzOi8vJHtwcm9wcyEuZG9tYWluTmFtZX1gLFxuICAgICAgICBkZXNjcmlwdGlvbjogJ0N1c3RvbSBEb21haW4gVVJMJyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxufSAiXX0=