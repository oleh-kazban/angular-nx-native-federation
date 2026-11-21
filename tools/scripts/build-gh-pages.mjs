import { execFileSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { resolve, join } from 'path';

const ROOT_DIR = resolve('.');
const OUTPUT_DIR = join(ROOT_DIR, 'dist', 'gh-pages');
const BASE_HREF = process.env.BASE_HREF || '/angular-nx-native-federation/';
const REMOTES = ['dashboard', 'reports'];

if (!BASE_HREF.startsWith('/') || !BASE_HREF.endsWith('/')) {
  throw new Error(`BASE_HREF must start and end with "/" (got "${BASE_HREF}")`);
}

// Run Nx through Node directly: no shell, so env values are passed as plain arguments.
const NX_BIN = createRequire(import.meta.url).resolve('nx/bin/nx.js');
const nxBuild = (project, baseHref) =>
  execFileSync(
    process.execPath,
    [NX_BIN, 'build', project, '--configuration=production', `--base-href=${baseHref}`],
    { stdio: 'inherit', cwd: ROOT_DIR },
  );

console.log('--- Building Native Federation Micro Frontends for GitHub Pages ---');

// 1. Clean native-federation cache to avoid path casing/normalization issues on Windows
const cacheDir = join(ROOT_DIR, 'node_modules', '.cache', 'native-federation');
if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
}

// 2. Build remotes with their dedicated base-href, then the shell with the root base-href
REMOTES.forEach((remote, i) => {
  console.log(`\n[${i + 1}/${REMOTES.length + 1}] Building remote: ${remote}...`);
  nxBuild(remote, `${BASE_HREF}remotes/${remote}/`);
});
console.log(`\n[${REMOTES.length + 1}/${REMOTES.length + 1}] Building host: shell...`);
nxBuild('shell', BASE_HREF);

// 3. Assemble the GitHub Pages artifact tree: shell at the root, remotes under remotes/<name>
console.log('\nAssembling GitHub Pages distribution bundle...');
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });
cpSync(join(ROOT_DIR, 'dist', 'apps', 'shell', 'browser'), OUTPUT_DIR, { recursive: true });
for (const remote of REMOTES) {
  const target = join(OUTPUT_DIR, 'remotes', remote);
  mkdirSync(target, { recursive: true });
  cpSync(join(ROOT_DIR, 'dist', 'apps', remote, 'browser'), target, { recursive: true });
}

// 4. Overwrite federation.manifest.json with production entries. They are relative to the
//    shell's base href (the shell resolves them against document.baseURI), so the bundle
//    works on any origin: a fork's GitHub Pages, a custom domain or a local server.
const prodManifest = Object.fromEntries(
  REMOTES.map((remote) => [remote, `remotes/${remote}/remoteEntry.json`]),
);
writeFileSync(
  join(OUTPUT_DIR, 'federation.manifest.json'),
  JSON.stringify(prodManifest, null, 2),
  'utf-8',
);
console.log('Production federation.manifest.json generated:');
console.log(JSON.stringify(prodManifest, null, 2));

// 5. Add .nojekyll so GitHub Pages does not ignore underscore-prefixed files (_angular_*.js)
writeFileSync(join(OUTPUT_DIR, '.nojekyll'), '', 'utf-8');
console.log('Created .nojekyll (bypasses Jekyll underscore filtering).');

// 6. Duplicate index.html to 404.html for client-side SPA route fallback
cpSync(join(OUTPUT_DIR, 'index.html'), join(OUTPUT_DIR, '404.html'));
console.log('Created 404.html (SPA fallback for direct route navigation).');

console.log(`\nSuccessfully assembled production bundle at: ${OUTPUT_DIR}\n`);
