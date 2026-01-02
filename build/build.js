const fs = require('fs-extra')
const path = require('path')
const {globSync} = require('glob')
const esbuild = require('esbuild')

// Source and destination directories
const sourceDir = path.resolve(__dirname, '..', 'ui')
const distDir = path.resolve(__dirname, 'dist')

async function build() {
  try {
    console.log('🚀 Starting build process...')

    // Step 1: Clean dist folder
    console.log('🧹 Cleaning dist folder...')
    await fs.emptyDir(distDir)

    // Step 2: Copy index.html, login.html, and change-password.html to dist folder
    console.log('📄 Copying HTML files...')
    await fs.copy(path.join(sourceDir, 'index.html'), path.join(distDir, 'index.html'))
    if (fs.existsSync(path.join(sourceDir, 'login.html'))) {
      await fs.copy(path.join(sourceDir, 'login.html'), path.join(distDir, 'login.html'))
    }
    if (fs.existsSync(path.join(sourceDir, 'change-password.html'))) {
      await fs.copy(path.join(sourceDir, 'change-password.html'), path.join(distDir, 'change-password.html'))
    }

    // Step 3: Copy index.js to dist folder
    console.log('📄 Copying index.js...')
    await fs.copy(path.join(sourceDir, 'index.js'), path.join(distDir, 'index.js'))
    if (fs.existsSync(path.join(sourceDir, 'login.js'))) {
      await fs.copy(path.join(sourceDir, 'login.js'), path.join(distDir, 'login.js'))
    }
    if (fs.existsSync(path.join(sourceDir, 'change-password.js'))) {
      await fs.copy(path.join(sourceDir, 'change-password.js'), path.join(distDir, 'change-password.js'))
    }

    // Step 3.1: Copy index.js to dist folder
    // console.log('📄 Copying mockServiceWorker.js... -- this should not happen when backend is done.');
    // await fs.copy(path.join(sourceDir, 'mockServiceWorker.js'), path.join(distDir, 'mockServiceWorker.js'));

    // Step 4: Copy styles.css if it exists
    if (fs.existsSync(path.join(sourceDir, 'styles.css'))) {
      console.log('📄 Copying styles.css...')
      await fs.copy(path.join(sourceDir, 'styles.css'), path.join(distDir, 'styles.css'))
    }

    // Step 5: Copy assets folder to dist
    console.log('📁 Copying assets folder...')
    await fs.copy(path.join(sourceDir, 'assets'), path.join(distDir, 'assets'))

    // Step 6: Bundle and minify JavaScript
    console.log('📦 Bundling and minifying JavaScript...')

    // Step 6.1: Create production index.html pointing to bundled files
    console.log('📝 fixing environment variables...')
    let indexJs = await fs.readFile(path.join(distDir, 'index.js'), 'utf8')

    // Replace module scripts with bundled version
    // indexJs = indexJs.replace( /import.meta.env\?.DEV/g, 'true' );
    await fs.writeFile(path.join(distDir, 'index.js'), indexJs)
    // Find all JavaScript files in assets and entry point
    const entryPoints = [
      path.join(distDir, 'index.js'),
      // ...globSync(path.join(sourceDir, 'assets/scripts/**/*.js')),
    ]

    await esbuild.build({
      entryPoints: entryPoints,
      bundle: true,
      minify: true,
      format: 'esm',
      splitting: true,
      outdir: path.join(distDir, 'bundled'),
      metafile: true,
      external: ['amazon-cognito-identity-js']
      /*
       // Handle @rinkkasatiainen modules as external dependencies
       // This means they won't be included in the bundle but referenced
      external: ['@rinkkasatiainen/!*'],
       plugins: [
         {
           name: 'external-modules',
           setup(build) {
             // Treat @rinkkasatiainen modules as external
             build.onResolve({ filter: /@rinkkasatiainen\// }, args => {
               return { external: true, path: args.path };
             });
           },
         },
       ],
       */
    }).then(result => {
      // Write out bundle analysis if needed
      fs.writeFileSync(
        path.join(distDir, 'bundle-analysis.json'),
        JSON.stringify(result.metafile)
      )
      console.log('✅ Bundle created successfully!')
    })


    // Step 7: Inject Cognito configuration and create production index.html
    console.log('🔄 Injecting Cognito config and creating production index.html...')

    // Get Cognito config from environment variables
    const cognitoConfig = {
      userPoolId: process.env.COGNITO_USER_POOL_ID || '',
      clientId: process.env.COGNITO_CLIENT_ID || '',
      region: process.env.AWS_REGION || process.env.CDK_DEFAULT_REGION || 'us-east-1',
      rootUrl: process.env.CFB_ROOT_URL || 'https://cfb.rinkkasatiainen.dev',
    }

    const configScript = `
    <script>
      window.CFB_CONFIG = ${JSON.stringify(cognitoConfig)};
    </script>`

    let indexHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8')

    // Inject config script before the closing </head> tag
    indexHtml = indexHtml.replace('</head>', `${configScript}\n</head>`)

    // Replace module scripts with bundled version
    indexHtml = indexHtml.replace(
      /<script type="module" src="index.js"><\/script>/g,
      '<script type="module" src="bundled/index.js"></script>'
    )

    // Write the modified index.html
    await fs.writeFile(path.join(distDir, 'index.html'), indexHtml)

    // Also update login.html and change-password.html if they exist
    if (fs.existsSync(path.join(distDir, 'login.html'))) {
      let loginHtml = await fs.readFile(path.join(distDir, 'login.html'), 'utf8')
      loginHtml = loginHtml.replace('</head>', `${configScript}\n</head>`)
      await fs.writeFile(path.join(distDir, 'login.html'), loginHtml)
    }
    if (fs.existsSync(path.join(distDir, 'change-password.html'))) {
      let changePasswordHtml = await fs.readFile(path.join(distDir, 'change-password.html'), 'utf8')
      changePasswordHtml = changePasswordHtml.replace('</head>', `${configScript}\n</head>`)
      await fs.writeFile(path.join(distDir, 'change-password.html'), changePasswordHtml)
    }

    console.log('✨ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

// Add this function to your existing build.js
async function bundleAwsSdk() {
  console.log('📦 Bundling AWS SDK components...')

  const vendorDir = path.join(distDir, 'assets/vendor')
  await fs.ensureDir(vendorDir)

  try {
    await esbuild.build({
      entryPoints: ['./node_modules/amazon-cognito-identity-js/es/index.js'],
      bundle: true,
      minify: false,
      format: 'esm',
      outfile: path.join(vendorDir, 'amazon-cognito-identity-js.js'),
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

    console.log('✅ AWS SDK components bundled successfully!')
  } catch (error) {
    console.error('❌ Failed to bundle AWS SDK:', error)
    throw error
  }
}

bundleAwsSdk()
build()
