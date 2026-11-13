import { execSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, cpSync, writeFileSync } from 'fs';
import { resolve, join } from 'path';

const ROOT_DIR = resolve('.');
const OUTPUT_DIR = join(ROOT_DIR, 'dist', 'gh-pages');
const BASE_HREF = process.env.BASE_HREF || '/angular-nx-native-federation/';
const PROD_ORIGIN = process.env.DEPLOY_ORIGIN || 'https://oleh-kazban.github.io';

console.log('--- Building Native Federation Micro Frontends for GitHub Pages ---');

// 1. Clean native-federation cache to avoid path casing/normalization issues on Windows
const cacheDir = join(ROOT_DIR, 'node_modules', '.cache', 'native-federation');
if (existsSync(cacheDir)) {
  rmSync(cacheDir, { recursive: true, force: true });
}

// 2. Build Remotes with their dedicated base-href
console.log('\n[1/3] Building remote: dashboard...');
execSync(
  `npx nx build dashboard --configuration=production --base-href=${BASE_HREF}remotes/dashboard/`,
  { stdio: 'inherit', cwd: ROOT_DIR },
);

console.log('\n[2/3] Building remote: reports...');
execSync(
  `npx nx build reports --configuration=production --base-href=${BASE_HREF}remotes/reports/`,
  { stdio: 'inherit', cwd: ROOT_DIR },
);

// 3. Build Shell with the root base-href
console.log('\n[3/3] Building host: shell...');
execSync(`npx nx build shell --configuration=production --base-href=${BASE_HREF}`, {
  stdio: 'inherit',
  cwd: ROOT_DIR,
});

// 4. Assemble GitHub Pages artifact tree
console.log('\nAssembling GitHub Pages distribution bundle...');
if (existsSync(OUTPUT_DIR)) {
  rmSync(OUTPUT_DIR, { recursive: true, force: true });
}
mkdirSync(OUTPUT_DIR, { recursive: true });

// Copy Shell to root
const shellDist = join(ROOT_DIR, 'dist', 'apps', 'shell', 'browser');
cpSync(shellDist, OUTPUT_DIR, { recursive: true });

// Copy Dashboard remote to remotes/dashboard
const dashboardDist = join(ROOT_DIR, 'dist', 'apps', 'dashboard', 'browser');
const dashboardTarget = join(OUTPUT_DIR, 'remotes', 'dashboard');
mkdirSync(dashboardTarget, { recursive: true });
cpSync(dashboardDist, dashboardTarget, { recursive: true });

// Copy Reports remote to remotes/reports
const reportsDist = join(ROOT_DIR, 'dist', 'apps', 'reports', 'browser');
const reportsTarget = join(OUTPUT_DIR, 'remotes', 'reports');
mkdirSync(reportsTarget, { recursive: true });
cpSync(reportsDist, reportsTarget, { recursive: true });

// 5. Overwrite federation.manifest.json with production endpoints
const prodManifest = {
  dashboard: `${PROD_ORIGIN}${BASE_HREF}remotes/dashboard/remoteEntry.json`,
  reports: `${PROD_ORIGIN}${BASE_HREF}remotes/reports/remoteEntry.json`,
};

writeFileSync(
  join(OUTPUT_DIR, 'federation.manifest.json'),
  JSON.stringify(prodManifest, null, 2),
  'utf-8',
);
console.log('Production federation.manifest.json generated:');
console.log(JSON.stringify(prodManifest, null, 2));

// 6. Add .nojekyll so GitHub Pages does not ignore underscore-prefixed files (_angular_*.js)
writeFileSync(join(OUTPUT_DIR, '.nojekyll'), '', 'utf-8');
console.log('Created .nojekyll (bypasses Jekyll underscore filtering).');

// 7. Duplicate index.html to 404.html for client-side SPA route fallback
cpSync(join(OUTPUT_DIR, 'index.html'), join(OUTPUT_DIR, '404.html'));
console.log('Created 404.html (SPA fallback for direct route navigation).');

console.log(`\nSuccessfully assembled production bundle at: ${OUTPUT_DIR}\n`);
