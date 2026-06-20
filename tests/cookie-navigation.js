/* global __ENV, open */

import { check } from 'k6';
import { browser } from 'k6/browser';

export const baseUrl = (__ENV.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
export const concurrentUsers = parsePositiveInteger(__ENV.K6_VUS, 1, 'K6_VUS');

const defaultAuthCookiesFile = '../auth-cookies.local.json';
const authCookiesFile = __ENV.AUTH_COOKIES_FILE || defaultAuthCookiesFile;

function parsePositiveInteger(value, defaultValue, envName) {
  if (!value) {
    return defaultValue;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`${envName} must be a positive integer`);
  }

  return parsedValue;
}

function loadAuthCookies() {
  try {
    return JSON.parse(open(authCookiesFile));
  } catch (error) {
    throw new Error(
      `Auth cookies file is required. Create ${authCookiesFile} or set AUTH_COOKIES_FILE. ${error.message}`,
    );
  }
}

function validateAuthCookies(cookies) {
  if (!Array.isArray(cookies)) {
    throw new Error('AUTH_COOKIES_FILE must contain a JSON array of browser cookies');
  }

  for (const cookie of cookies) {
    if (!cookie.name || !Object.prototype.hasOwnProperty.call(cookie, 'value')) {
      throw new Error('Each auth cookie must include name and value');
    }

    if (!cookie.url && (!cookie.domain || !cookie.path)) {
      throw new Error('Each auth cookie must include url or both domain and path');
    }
  }
}

const authCookies = loadAuthCookies();
validateAuthCookies(authCookies);

async function locatorIsVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

async function waitForScreen(page, scenario) {
  const deadline = Date.now() + 10000;
  const signInTitle = page.getByText('ポータルにサインイン');
  const targetLocators = scenario.visibleLocators(page);

  while (Date.now() < deadline) {
    if (await locatorIsVisible(signInTitle)) {
      return 'signIn';
    }

    for (const targetLocator of targetLocators) {
      if (await locatorIsVisible(targetLocator)) {
        return 'target';
      }
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`${scenario.name} が表示されませんでした`);
}

export async function runCookieNavigation(scenario) {
  const context = await browser.newContext();
  let page;

  try {
    await context.addCookies(authCookies);

    page = await context.newPage();
    const startedAt = Date.now();

    await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: 'networkidle' });

    const screen = await waitForScreen(page, scenario);

    if (screen === 'signIn') {
      check(page, {
        [`#${scenario.number} Cookie注入時にログイン画面へ戻されない`]: () => false,
      });
      throw new Error(
        'Cookie注入後もログイン画面が表示されました。Cookieの期限切れ、domain、pathを確認してください。',
      );
    }

    scenario.trend.add(Date.now() - startedAt);

    check(page, {
      [`#${scenario.number} ${scenario.name} が表示される`]: () => true,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
