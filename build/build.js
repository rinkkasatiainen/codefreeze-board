const fs = require('fs-extra');
const path = require('path');
const { globSync } = require('glob');
const esbuild = require('esbuild');

// Source and destination directories
const sourceDir = path.resolve(__dirname, '..', 'ui');
const distDir = path.resolve(__dirname, 'dist');

async function build() {
  try {
    console.log('🚀 Starting build process...');
    
    // Step 1: Clean dist folder
    console.log('🧹 Cleaning dist folder...');
    await fs.emptyDir(distDir);
    
    // Step 2: Copy index.html to dist folder
    console.log('📄 Copying index.html...');
    await fs.copy(path.join(sourceDir, 'index.html'), path.join(distDir, 'index.html'));
    
    // Step 3: Copy index.js to dist folder
    console.log('📄 Copying index.js...');
    await fs.copy(path.join(sourceDir, 'index.js'), path.join(distDir, 'index.js'));
    
    // Step 4: Copy styles.css if it exists
    if (fs.existsSync(path.join(sourceDir, 'styles.css'))) {
      console.log('📄 Copying styles.css...');
      await fs.copy(path.join(sourceDir, 'styles.css'), path.join(distDir, 'styles.css'));
    }
    
    // Step 5: Copy _public folder to dist
    console.log('📁 Copying _public folder...');
    await fs.copy(path.join(sourceDir, '_public'), path.join(distDir, '_public'));
    
    // Step 6: Bundle and minify JavaScript
    console.log('📦 Bundling and minifying JavaScript...');
    
    // Find all JavaScript files in _public and entry point
    const entryPoints = [
      path.join(sourceDir, 'index.js'),
      ...globSync(path.join(sourceDir, '_public/**/*.js')),
    ];
    
    await esbuild.build({
      entryPoints: entryPoints,
      bundle: true,
      minify: true,
      format: 'esm',
      splitting: true,
      outdir: path.join(distDir, 'bundled'),
      metafile: true,
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
      );
      console.log('✅ Bundle created successfully!');
    });

    // Step 7: Create production index.html pointing to bundled files
    console.log('🔄 Creating production index.html...');
    let indexHtml = await fs.readFile(path.join(distDir, 'index.html'), 'utf8');
    
    // Replace module scripts with bundled version
    indexHtml = indexHtml.replace(
      /<script type="module" src="index.js"><\/script>/g,
      '<script type="module" src="bundled/index.js"></script>'
    );
    
    indexHtml = indexHtml.replace(
      /<script type="module" src="_public\/scripts\/index.js"><\/script>/g,
      '<script type="module" src="bundled/_public/scripts/index.js"></script>'
    );
    
    // Write the modified index.html
    await fs.writeFile(path.join(distDir, 'index.html'), indexHtml);
    
    console.log('✨ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
