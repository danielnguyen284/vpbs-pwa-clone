/**
 * Generate PWA assets: apple-touch-icon 180x180, splash screens for iOS
 * Uses sharp (already in devDependencies)
 */
import sharp from 'sharp';
import { mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');

// Ensure directories exist
const splashDir = join(PUBLIC, 'splash');
const screenshotsDir = join(PUBLIC, 'screenshots');
if (!existsSync(splashDir)) mkdirSync(splashDir, { recursive: true });
if (!existsSync(screenshotsDir)) mkdirSync(screenshotsDir, { recursive: true });

const SOURCE_ICON = join(PUBLIC, 'icon-512x512.png');
const BG_COLOR = { r: 10, g: 14, b: 26, alpha: 1 }; // #0A0E1A (new VTS Invest bg)

// ---- 1. Apple Touch Icon 180x180 ----
async function generateAppleTouchIcon() {
  const output = join(PUBLIC, 'apple-touch-icon-180x180.png');
  await sharp(SOURCE_ICON)
    .resize(180, 180)
    .png()
    .toFile(output);
  console.log('✅ apple-touch-icon-180x180.png');
}

// ---- 2. iOS Splash Screens ----
// Format: [width, height, pixelRatio, deviceName]
const SPLASH_SPECS = [
  // iPhone 16 Pro Max
  [1320, 2868, 3, 'iPhone 16 Pro Max'],
  // iPhone 16 Pro
  [1206, 2622, 3, 'iPhone 16 Pro'],
  // iPhone 16 Plus / 15 Plus / 14 Plus
  [1290, 2796, 3, 'iPhone 16 Plus'],
  // iPhone 16 / 15 / 15 Pro / 14 Pro
  [1179, 2556, 3, 'iPhone 15'],
  // iPhone 14 / 13 / 13 Pro / 12 / 12 Pro
  [1170, 2532, 3, 'iPhone 14'],
  // iPhone 13 mini / 12 mini
  [1080, 2340, 3, 'iPhone 13 mini'],
  // iPhone 11 Pro Max / XS Max
  [1242, 2688, 3, 'iPhone 11 Pro Max'],
  // iPhone 11 / XR
  [828, 1792, 2, 'iPhone 11'],
  // iPhone 11 Pro / XS / X
  [1125, 2436, 3, 'iPhone X'],
  // iPhone 8 Plus
  [1242, 2208, 3, 'iPhone 8 Plus'],
  // iPhone SE / 8
  [750, 1334, 2, 'iPhone SE'],
];

async function generateSplashScreen(width, height) {
  const iconSize = Math.round(Math.min(width, height) * 0.25);
  const iconBuffer = await sharp(SOURCE_ICON)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();

  const left = Math.round((width - iconSize) / 2);
  const top = Math.round((height - iconSize) / 2);

  const output = join(splashDir, `apple-splash-${width}-${height}.png`);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([{ input: iconBuffer, left, top }])
    .png()
    .toFile(output);
  
  console.log(`✅ splash ${width}x${height}`);
}

// ---- 3. Screenshots for manifest ----
async function generateScreenshot(width, height, label, filename) {
  const iconSize = Math.round(Math.min(width, height) * 0.3);
  const iconBuffer = await sharp(SOURCE_ICON)
    .resize(iconSize, iconSize)
    .png()
    .toBuffer();
  
  const left = Math.round((width - iconSize) / 2);
  const top = Math.round((height - iconSize) / 2 - height * 0.05);

  // Create text overlay with SVG
  const textSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <text x="${width / 2}" y="${top + iconSize + 60}" 
        font-family="Inter, Arial, sans-serif" font-size="36" font-weight="bold"
        fill="white" text-anchor="middle">${label}</text>
    </svg>
  `);

  const output = join(screenshotsDir, filename);
  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: BG_COLOR,
    },
  })
    .composite([
      { input: iconBuffer, left, top },
      { input: textSvg, left: 0, top: 0 },
    ])
    .png()
    .toFile(output);

  console.log(`✅ screenshot ${filename}`);
}

// ---- Run all ----
async function main() {
  console.log('🚀 Generating PWA assets...\n');

  await generateAppleTouchIcon();

  console.log('\n📱 Generating iOS splash screens...');
  for (const [w, h] of SPLASH_SPECS) {
    await generateSplashScreen(w, h);
  }

  console.log('\n📸 Generating manifest screenshots...');
  await generateScreenshot(1080, 1920, 'VTS Invest - Giao dịch Chứng khoán', 'mobile-1.png');
  await generateScreenshot(1080, 1920, 'VTS Invest - Danh mục Đầu tư', 'mobile-2.png');

  console.log('\n✅ All PWA assets generated!');
}

main().catch(console.error);
