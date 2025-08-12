import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as path from 'path';

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
      // accessControl: s3.BucketAccessControl.PRIVATE,
      // websiteIndexDocument: 'index.html',
      // websiteErrorDocument: 'index.html',
      publicReadAccess: false, // We'll use CloudFront for access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
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

    // Certificate and domain setup
    let certificate: acm.ICertificate | undefined;
    let hostedZone: route53.IHostedZone | undefined;
    
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
      return
    }
    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, {
          originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: new cloudfront.ResponseHeadersPolicy(this, 'MainResponseHeadersPolicy', {
          responseHeadersPolicyName: 'CodefreezeBoardMainHeaders',
          comment: 'Headers for CodeFreeze Board main content',
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
        target: route53.RecordTarget.fromAlias(
          new targets.CloudFrontTarget(distribution)
        ),
        recordName: props!.domainName,
      });
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
  }
} 