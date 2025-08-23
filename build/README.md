# Purpose of this folder

The main purpose of this folder is to create a build that can de deployed to AWS using 
CDK.

The CDK shall deploy this so S3 with a CloudFront distribution

## Test locally:

run build script
`yarn build`

then go to 'dist' directory and run http server:
```text
cd dist
npx http-server -a 0.0.0.0 -p 8080
```

and open 'localhost:8080' in your browser.
