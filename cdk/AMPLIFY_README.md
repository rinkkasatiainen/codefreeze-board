# CodeFreeze Board Amplify Deployment

This CDK stack deploys your CodeFreeze Board UI using AWS Amplify, which provides automatic builds, deployments, and hosting.

## Architecture

- **AWS Amplify**: Handles builds, deployments, and hosting
- **GitHub Integration**: Connects to your GitHub repository
- **Custom Domain**: `demo.rinkkasatiainen.dev` with SSL certificate
- **Route53**: DNS management
- **CloudFront**: Global CDN (handled by Amplify)

## Prerequisites

1. **GitHub Repository**: Your code must be in a GitHub repository
2. **GitHub Token**: Create a personal access token with repo access
3. **Route53 Hosted Zone**: For `demo.rinkkasatiainen.dev`

## Setup Steps

### 1. Create GitHub Token
```bash
# Go to GitHub Settings > Developer settings > Personal access tokens
# Create a token with 'repo' permissions
# Store it in AWS Secrets Manager
aws secretsmanager create-secret \
  --name github-token \
  --secret-string "your-github-token-here" \
  --profile PowerUserAccess-094009463545
```

### 2. Update Repository Information
Edit `bin/cfb-amplify-cdk.ts` and update:
```typescript
const githubRepo = 'your-username/codefreeze-board'; // Your actual repo
```

### 3. Deploy the Stack
```bash
cd cdk
./deploy-amplify.sh
```

## How It Works

1. **Build Process**: Amplify will:
   - Clone your GitHub repository
   - Navigate to the `ui` folder
   - Run `yarn install` and `yarn build`
   - Deploy from `ui/build/dist`

2. **Static Files**: All files including `mockServiceWorker.js` will be served correctly

3. **SPA Routing**: Custom rules redirect all routes to `index.html`

4. **Custom Domain**: SSL certificate and DNS are configured automatically

## Benefits Over S3+CloudFront

- ✅ **Automatic builds** from GitHub
- ✅ **Static files work correctly** (no SPA fallback issues)
- ✅ **Simpler configuration**
- ✅ **Built-in CI/CD**
- ✅ **Automatic SSL certificates**
- ✅ **Preview deployments** for branches

## File Structure Expected

Your GitHub repository should have:
```
your-repo/
├── ui/
│   ├── index.html
│   ├── index.js
│   ├── styles.css
│   ├── mockServiceWorker.js
│   ├── package.json
│   └── build.sh
└── README.md
```

## Deployment Commands

```bash
# Deploy with custom parameters
cdk deploy --app "npx ts-node --prefer-ts-exts bin/cfb-amplify-cdk.ts" \
  --profile PowerUserAccess-094009463545 \
  -c domainName=demo.rinkkasatiainen.dev \
  -c hostedZoneId=Z1234567890ABC \
  -c githubRepo=your-username/codefreeze-board

# Check deployment status
aws amplify list-apps --profile PowerUserAccess-094009463545
```

## Troubleshooting

### Build Failures
- Check Amplify console for build logs
- Ensure `ui/package.json` exists
- Verify `yarn build` works locally

### Domain Issues
- Verify Route53 hosted zone exists
- Check certificate validation status
- Ensure DNS propagation (can take 24-48 hours)

### GitHub Integration
- Verify GitHub token has correct permissions
- Check repository is public or token has access
- Ensure repository structure matches expected layout 