import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const inputPath = resolve(process.env.AUTH_COOKIES_RESULT || process.argv[2] || 'result.txt');
const outputPath = resolve(
  process.env.AUTH_COOKIES_OUTPUT || process.argv[3] || 'auth-cookies.local.json',
);
const startMarker = 'AUTH_COOKIES_JSON_START';
const endMarker = 'AUTH_COOKIES_JSON_END';

const resultText = readFileSync(inputPath, 'utf8');
const normalizedResultText = resultText
  .split('\n')
  .map((line) => {
    const messageMatch = line.match(/\bmsg=(?:"((?:\\"|[^"])*)"|([^ ]+))/);

    if (!messageMatch) {
      return line;
    }

    return (messageMatch[1] ?? messageMatch[2]).replace(/\\"/g, '"');
  })
  .join('\n');
const startIndex = normalizedResultText.indexOf(startMarker);
const endIndex = normalizedResultText.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  console.error(`Could not find ${startMarker}/${endMarker} in ${inputPath}.`);
  process.exit(1);
}

const jsonText = normalizedResultText.slice(startIndex + startMarker.length, endIndex).trim();

try {
  const cookies = JSON.parse(jsonText);

  if (!Array.isArray(cookies)) {
    throw new Error('captured JSON is not an array');
  }

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, `${JSON.stringify(cookies, null, 2)}\n`);
  console.log(`Saved ${cookies.length} cookies to ${outputPath}`);
} catch (error) {
  console.error(`Failed to extract auth cookies: ${error.message}`);
  process.exit(1);
}
