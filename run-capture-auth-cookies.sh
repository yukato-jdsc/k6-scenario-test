#!/usr/bin/env bash
set -euo pipefail

export K6_BROWSER_HEADLESS=true

k6 run utils/capture-auth-cookies.js > result.txt 2>&1
node utils/extract-k6-auth-cookies.mjs

rm -f result.txt
