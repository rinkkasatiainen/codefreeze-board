# CodeFreeze Board Deployment Guide

## Prerequisites

1. **AWS CLI configured with SSO** ✅ (You have this)
2. **Domain name** (e.g., `yourdomain.com`)
3. **GoDaddy DNS access**

## Step 1: Set up Route53 Hosted Zone

Since you have DNS in GoDaddy, you have two options:

### Option A: Use AWS Route53 (Recommended)
1. Go to AWS Route53 console
2. Create a new hosted zone for your domain
3. Copy the hosted zone ID (looks like `Z1234567890ABC`)
4. Update your GoDaddy nameservers to point to AWS nameservers

### Option B: Keep GoDaddy DNS
1. Get your GoDaddy hosted zone ID (you'll need to find this)
2. Use GoDaddy's DNS management

## Step 2: Deploy with Custom Domain

### Method 1: Using CDK Context
```bash
cd cdk
yarn cdk:run deploy --profile PowerUserAccess-094009463545 \
  -c domainName=yourdomain.com \
  -c hostedZoneId=Z1234567890ABC
```

### Method 2: Using Environment Variables
```bash
export DOMAIN_NAME=yourdomain.com
export HOSTED_ZONE_ID=Z1234567890ABC
yarn cdk:run deploy --profile PowerUserAccess-094009463545
```

## Step 3: Certificate Validation

When you deploy, AWS Certificate Manager will:
1. Request a certificate for your domain
2. Create DNS validation records in Route53
3. Validate the certificate automatically

**If using GoDaddy DNS**: You'll need to manually add the validation records to GoDaddy.

## Step 4: DNS Configuration

### For Route53 (Option A)
- CDK will automatically create the A record pointing to CloudFront
- No manual DNS changes needed

### For GoDaddy (Option B)
After deployment, add these records in GoDaddy:
```
Type: A
Name: @ (or your subdomain)
Value: [CloudFront Distribution Domain]
```

## Step 5: Verify Deployment

1. Wait for certificate validation (can take 5-30 minutes)
2. Check your custom domain: `https://yourdomain.com`
3. Verify HTTPS is working

## Troubleshooting

### Certificate Issues
- Check Route53/GoDaddy for validation records
- Ensure nameservers are correctly configured
- Wait up to 30 minutes for validation

### DNS Issues
- Verify A record points to CloudFront distribution
- Check for CNAME conflicts
- Ensure TTL is reasonable (300 seconds)

### CloudFront Issues
- Check distribution status in AWS console
- Verify origin access identity is configured
- Check S3 bucket permissions

## Cost Considerations

- **Route53**: ~$0.50/month per hosted zone
- **Certificate**: Free with AWS Certificate Manager
- **CloudFront**: Pay per request + data transfer
- **S3**: Minimal cost for static hosting

## Security Notes

- HTTPS is enforced
- S3 bucket is private (CloudFront only access)
- Certificate auto-renews every 13 months
- Origin Access Identity prevents direct S3 access 