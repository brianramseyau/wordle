# Self-hosted, self-contained [Wordle](https://www.powerlanguage.co.uk/wordle/) clone (legacy)

This is the original NYT-style Wordle, cloned from the original website and served from a self-contained Nginx container. It uses the original date-based word-of-the-day logic and progress storage, in line with the real NYT Wordle.

There is no other flavor of this app in this repo any more — the "latest" React/Tailwind rewrite has been removed so there's only one thing to maintain and one thing to trust your saved stats with.

## Docker

Images are built and published to the GitHub Container Registry by the [Docker CI](.github/workflows/Docker%20CI.yml) workflow on every push to `master`.

```yaml
version: "2.4"

services:

  wordle:
    image: ghcr.io/brianramseyau/wordle:latest
    container_name: Wordle
    ports:
      - 80:80
```

### Routing

Every path the nginx container serves returns the app itself with an HTTP 200 — there is no path that produces a real 404. Unknown/deep-link paths are served `index.html` directly (`try_files $uri $uri/ /index.html;` in [conf/nginx-site.conf](conf/nginx-site.conf)), rather than the old approach of redirecting a 404 error page to `index.html` (which kept responding with a 404 status while still rendering the app).

## Native Android app

The [`mobile/`](mobile/) directory contains a [Capacitor](https://capacitorjs.com/) wrapper that bundles the exact same static site from [`public/`](public/) into a native Android app. Because it's a distinct installed app, its WebView gets its own private storage sandbox from Android — completely separate from Chrome, Firefox, or any other browser on the device, and from any other app's WebView. Clearing your browser cache/cookies (the thing that keeps wiping progress in-browser) cannot touch it.

See [mobile/README.md](mobile/README.md) for how to build and install the debug APK.

## Project Screenshot

![image](https://user-images.githubusercontent.com/4349962/152651710-32fc8be9-b63a-47b3-b1f3-ec7baf0e34f8.png)
