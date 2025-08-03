# CodeFreeze Board CDK Infrastructure

This CDK project deploys the CodeFreeze Board UI to AWS using S3 + CloudFront.

## Architecture

- **S3 Bucket**: Static website hosting
- **CloudFront**: CDN for global distribution and HTTPS
- **Origin Access Identity**: Secure access from CloudFront to S3

## Prerequisites

0. Install aws cli
   - and authenticate using it `aws configure sso` 

1. Install AWS CDK CLI:
   ```bash
   npm install -g aws-cdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure AWS credentials:
   ```bash
   aws configure
   ```

## Deployment

1. Bootstrap CDK (first time only):
   ```bash
   cdk bootstrap
   ```

2. Deploy the stack:
   ```bash
   yarn deploy
   ```

3. View the deployed URL in the CDK outputs.

## Development

- `yarn build` - Build the TypeScript
- `yarn watch` - Watch for changes
- `yarn diff` - See what will change
- `yarn synth` - Synthesize CloudFormation template

## Customization

### Environment Variables
- `CDK_DEFAULT_ACCOUNT` - AWS account ID
- `CDK_DEFAULT_REGION` - AWS region

### Stack Configuration
Edit `lib/codefreeze-board-stack.ts` to modify:
- Bucket name
- CloudFront settings
- Caching policies
- Price class (for cost optimization)

## Security Notes

- The S3 bucket is private and only accessible via CloudFront
- HTTPS is enforced
- Origin Access Identity prevents direct S3 access
- Error pages redirect to index.html for SPA routing

## Cost Optimization

- Uses `PRICE_CLASS_100` (North America and Europe only)
- Consider changing `removalPolicy` and `autoDeleteObjects` for production
- Monitor CloudFront usage for cost optimization 