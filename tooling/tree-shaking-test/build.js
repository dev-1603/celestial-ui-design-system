const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function measureBundle(inputFile) {
  const outputFile = path.join(__dirname, 'dist', path.basename(inputFile, '.ts') + '.js');

  try {
    const result = await esbuild.build({
      entryPoints: [inputFile],
      bundle: true,
      minify: true,
      format: 'esm',
      outfile: outputFile,
      metafile: true,
      treeShaking: true,
      platform: 'browser',
      // Externalize nothing - we want to see exactly what gets bundled from the packages
      external: [],
    });

    const fileBuffer = fs.readFileSync(outputFile);
    const rawSize = fileBuffer.length;
    const gzipSize = zlib.gzipSync(fileBuffer).length;

    console.log(`\n==================================================`);
    console.log(`TEST: ${inputFile}`);
    console.log(`--------------------------------------------------`);
    console.log(`Raw minified size: ${(rawSize / 1024).toFixed(2)} KB`);
    console.log(`Gzip size:         ${(gzipSize / 1024).toFixed(2)} KB`);

    // Analyze modules in the bundle from the metafile
    const outputs = Object.values(result.metafile.outputs);
    const modules = outputs.length > 0 ? outputs[0].inputs : {};
    const modulePaths = Object.keys(modules);
    console.log(`Modules included:  ${modulePaths.length}`);

    const pkgStats = {};
    for (const mod of modulePaths) {
      const match = mod.match(/node_modules\/(@celestial-ui\/[^\/]+)/);
      if (match) {
        const pkg = match[1];
        pkgStats[pkg] = (pkgStats[pkg] || 0) + 1;
      }
    }

    console.log(`\nModules:`);
    for (const mod of modulePaths) {
      console.log(`  ${mod}`);
    }

    console.log(`==================================================\n`);
  } catch (err) {
    console.error(`Failed to build ${inputFile}:`, err);
  }
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Please provide at least one input file.');
    process.exit(1);
  }

  for (const file of args) {
    await measureBundle(path.resolve(file));
  }
}

run();
