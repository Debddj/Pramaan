const fs = require('fs');
const path = require('path');

const externalsPath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

if (fs.existsSync(externalsPath)) {
  let content = fs.readFileSync(externalsPath, 'utf8');
  let modified = false;

  // 1. Filter out colon-containing modules (e.g. node:sea, node:sqlite on Node 22+ on Windows)
  if (!content.includes('!/^_|^(internal|v8|node-inspect)\\/|\\/|:/.test(x)')) {
    content = content.replace(
      /!\/\\^_\|\^\(internal\|v8\|node-inspect\)\\\/\|\\\/\/\.test\(x\)/g,
      '!/^_|^(internal|v8|node-inspect)\\/|\\/|:/.test(x)'
    );
    modified = true;
  }

  // 2. Defensive check in tapNodeShims loop
  if (!content.includes('if (moduleId.includes(":")) continue;')) {
    content = content.replace(
      'for (const moduleId of NODE_STDLIB_MODULES){',
      'for (const moduleId of NODE_STDLIB_MODULES){\n        if (moduleId.includes(":")) continue;'
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(externalsPath, content, 'utf8');
    console.log('[Pramaan Patch] Successfully patched @expo/cli externals.js for Windows Node 22+ compatibility.');
  }
}
