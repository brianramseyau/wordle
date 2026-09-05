// Patches the copied index.html (mobile/www/, built from ../public/) so the
// game's "Share" button opens Android's native share sheet instead of just
// copying to the clipboard.
//
// The game's own JS falls back to clipboard-copy whenever
// `navigator.share`/`navigator.canShare` aren't usable — which is the case
// in Capacitor's plain WebView. This installs those two functions, backed
// by the @capacitor/share plugin, before the game's bundle runs, so its own
// feature-detection picks them up and calls through to the native share
// sheet instead.
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'www', 'index.html');
const shim = `
    <script>
      (function () {
        // The Capacitor bridge (window.Capacitor) is injected before this
        // script runs, but its plugins can attach a beat later, so poll
        // briefly rather than assuming it's there on the first tick.
        var tries = 0;
        (function installShareShim() {
          var Share = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
          if (!Share) {
            if (++tries < 50) setTimeout(installShareShim, 100);
            return;
          }
          navigator.share = function (data) {
            return Share.share({
              title: data && data.title,
              text: data && data.text,
              url: data && data.url,
            });
          };
          navigator.canShare = function () {
            return true;
          };
        })();
      })();
    </script>
`;

let html = fs.readFileSync(indexPath, 'utf8');
if (!html.includes('Capacitor.Plugins.Share')) {
  html = html.replace('<body>', `<body>\n${shim}`);
  fs.writeFileSync(indexPath, html);
}
