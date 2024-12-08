# The `/cdn-static` Folder

Files placed here are uploaded as-is to Auth Relayer's production CDN at build time (excluding this README). **These files are not served by Express during local development.** For this reason, we generally avoid using `/cdn-static` for serving images, fonts, and other assets visible to the markup. This limitation is imposed because these assets are intended to be consumed only via CDN; so `/its-alive.jpg` would actually exist at `https://assets.auth.magic.link/its-alive.jpg`.

The current use-case here is to enable simple health-checks for our CDN. In the future, we may expand this functionality to include `.well-known` files, etc.
