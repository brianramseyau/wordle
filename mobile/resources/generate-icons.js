// One-off script: builds Android adaptive-icon layers and a splash screen
// from the real Wordle "W" logo (public/images/wordle_logo_192x192.png),
// since @capacitor/assets needs separate foreground/background layers to
// avoid the launcher's circular/square mask clipping the letter.
const sharp = require('sharp');
const path = require('path');

const SRC = path.join(__dirname, '..', '..', 'public', 'images', 'wordle_logo_192x192.png');
const GREEN = { r: 0x6a, g: 0xaa, b: 0x64 };
const SIZE = 1024;

async function extractForeground() {
  const { data, info } = await sharp(SRC)
    .resize(SIZE, SIZE, { kernel: 'nearest' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const r = data[i * info.channels];
    const g = data[i * info.channels + 1];
    const b = data[i * info.channels + 2];
    // White letter vs. green background: threshold on brightness.
    const isWhite = r > 180 && g > 180 && b > 180;
    out[i * 4] = 255;
    out[i * 4 + 1] = 255;
    out[i * 4 + 2] = 255;
    out[i * 4 + 3] = isWhite ? 255 : 0;
  }

  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png();
}

async function main() {
  const foregroundFull = await extractForeground().then((img) => img.toBuffer());

  // Shrink the letter to Android's ~66% adaptive-icon safe zone, centered
  // on a transparent canvas, so launchers that crop to a circle/square
  // don't clip it.
  const shrunk = await sharp(foregroundFull)
    .resize(Math.round(SIZE * 0.62), Math.round(SIZE * 0.62), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: shrunk, gravity: 'center' }])
    .png()
    .toFile(path.join(__dirname, 'icon-foreground.png'));

  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { ...GREEN, alpha: 1 } },
  })
    .png()
    .toFile(path.join(__dirname, 'icon-background.png'));

  // Legacy (non-adaptive) launcher icon: the original full-bleed logo.
  await sharp(SRC).resize(SIZE, SIZE, { kernel: 'nearest' }).png().toFile(path.join(__dirname, 'icon.png'));

  // Splash: green field with the letter centered, smaller.
  const SPLASH = 2732;
  const splashLetter = await sharp(foregroundFull)
    .resize(Math.round(SPLASH * 0.28), Math.round(SPLASH * 0.28), { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({
    create: { width: SPLASH, height: SPLASH, channels: 4, background: { ...GREEN, alpha: 1 } },
  })
    .composite([{ input: splashLetter, gravity: 'center' }])
    .png()
    .toFile(path.join(__dirname, 'splash.png'));

  console.log('done');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
