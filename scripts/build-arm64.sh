#!/bin/bash

pnpm run build && deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --allow-write \
  --allow-sys \
  --allow-run \
  --target=aarch64-apple-darwin \
  --output=binary/mcp-desktopcommander-aarch64-apple-darwin \
  ./dist/index.js