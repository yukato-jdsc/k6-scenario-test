/* global __ENV */

import { check } from 'k6';
import { browser } from 'k6/browser';

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
const username = __ENV.K6_USERNAME || 'testuser';
const password = __ENV.K6_PASSWORD || 'password123';

export const options = {
  scenarios: {
    capture_auth_cookies: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

async function locatorIsVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

async function waitForInitialScreen(page) {
  const deadline = Date.now() + 10000;
  const signInTitle = page.getByText('ポータルにサインイン');
  const applicationListHeading = page.getByRole('heading', {
    name: '申込書一覧',
    level: 1,
  });

  while (Date.now() < deadline) {
    if (await locatorIsVisible(signInTitle)) {
      return 'signIn';
    }

    if (await locatorIsVisible(applicationListHeading)) {
      return 'applicationList';
    }

    await page.waitForTimeout(250);
  }

  throw new Error('ログイン画面または申込書一覧画面が表示されませんでした');
}

export default async function captureAuthCookies() {
  const context = await browser.newContext();
  let page;

  try {
    page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    const initialScreen = await waitForInitialScreen(page);
    const applicationListHeading = page.getByRole('heading', {
      name: '申込書一覧',
      level: 1,
    });

    if (initialScreen === 'signIn') {
      await page.getByRole('button', { name: '会社 SSO で続行' }).click();
      await page.locator('input#username').fill(username);
      await page.locator('input#password').fill(password);

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => null),
        page.locator('button[type="submit"], input[type="submit"]').first().click(),
      ]);
    }

    await applicationListHeading.waitFor({ state: 'visible', timeout: 10000 });

    const cookies = await context.cookies();
    console.log('AUTH_COOKIES_JSON_START');
    console.log(JSON.stringify(cookies));
    console.log('AUTH_COOKIES_JSON_END');

    check(cookies, {
      '認証Cookieを取得できる': (capturedCookies) => capturedCookies.length > 0,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
