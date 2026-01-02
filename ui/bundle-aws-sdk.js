const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs-extra');

async function bundleAwsSdk() {
  console.log('📦 Bundling AWS SDK components...');

  const outputDir = path.resolve(__dirname, 'assets/vendor');

  // Ensure the output directory exists
  await fs.ensureDir(outputDir);

  try {
    // Bundle the Cognito Identity client
    await esbuild.build({
      entryPoints: ['./node_modules/amazon-cognito-identity-js/es/index.js'],
      bundle: true,
      minify: false,
      format: 'esm',
      outfile: path.join(outputDir, 'amazon-cognito-identity-js.js'),
      metafile: true,
      // Add globals definitions and platform settings for browser
      define: {
        'global': 'window',
        'process.env.NODE_ENV': '"production"'
      },
      // Specify browser platform to avoid Node.js specific code
      platform: 'browser',
      target: ['es2020'],  // Use a modern target
      external: [], // Don't exclude any dependencies
      // Inject a small polyfill for buffer if needed
      // inject: ['./buffer-polyfill.js'],

    });

    // Add other AWS SDK components as needed
    // For example, if you need client-cognito-identity-provider:
    /*
    await esbuild.build({
      entryPoints: ['./node_modules/@aws-sdk/client-cognito-identity-provider/dist-es/index.js'],
      bundle: true,
      minify: true,
      format: 'esm',
      outfile: path.join(outputDir, 'aws-cognito-identity-provider.js'),
      metafile: true,
    });
    */

    console.log('✅ AWS SDK components bundled successfully!');
  } catch (error) {
    console.error('❌ Failed to bundle AWS SDK:', error);
    process.exit(1);
  }
}

bundleAwsSdk();