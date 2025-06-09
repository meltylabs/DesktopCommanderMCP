#!/bin/bash

pnpm run build && deno compile \
  --allow-env \
  --allow-net \
  --allow-read \
  --allow-write \
  --allow-sys \
  --allow-run \
  --target=x86_64-apple-darwin \
  --output=binary/mcp-desktopcommander-x86_64-apple-darwin \
  ./dist/index.js