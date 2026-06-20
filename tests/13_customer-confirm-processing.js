/* global __ENV */

import { check } from 'k6';
import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { authCookies, baseUrl, concurrentUsers } from './cookie-navigation.js';

const applicationId = __ENV.K6_APPLICATION_ID || '2';
const scenario = {
  number: 13,
  name: 'LLMによる顧客情報抽出・提供条件特定処理',
  path: `/scb020101?applicationId=${encodeURIComponent(applicationId)}`,
};

export const scenario13CustomerConfirmProcessingDuration = new Trend(
  'scenario_13_customer_confirm_processing_duration',
  true,
);

export const options = {
  scenarios: {
    customer_confirm_processing: {
      executor: 'shared-iterations',
      vus: concurrentUsers,
      iterations: concurrentUsers,
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
    scenario_13_customer_confirm_processing_duration: ['p(95)<120000'],
  },
};

async function locatorIsVisible(locator) {
  try {
    return await locator.isVisible();
  } catch {
    return false;
  }
}

async function waitForAuthenticatedScreen(page, scenarioName, visibleLocators) {
  const deadline = Date.now() + 10000;
  const signInTitle = page.getByText('ポータルにサインイン');

  while (Date.now() < deadline) {
    if (await locatorIsVisible(signInTitle)) {
      return 'signIn';
    }

    for (const targetLocator of visibleLocators) {
      if (await locatorIsVisible(targetLocator)) {
        return 'target';
      }
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`${scenarioName} が表示されませんでした`);
}

async function waitForEnabledButton(page, buttonText, timeout = 120000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const isEnabled = await page.evaluate(
      (text) =>
        Array.from(document.querySelectorAll('button')).some(
          (button) =>
            button.textContent.trim() === text &&
            !button.disabled &&
            button.getAttribute('aria-disabled') !== 'true',
        ),
      buttonText,
    );

    if (isEnabled) {
      return;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`${buttonText} ボタンがクリック可能になりませんでした`);
}

async function clickEnabledButton(page, buttonText) {
  await waitForEnabledButton(page, buttonText);

  await page.evaluate((text) => {
    const targetButton = Array.from(document.querySelectorAll('button')).find(
      (button) =>
        button.textContent.trim() === text &&
        !button.disabled &&
        button.getAttribute('aria-disabled') !== 'true',
    );

    if (!targetButton) {
      throw new Error(`${text} ボタンが見つかりませんでした`);
    }

    targetButton.click();
  }, buttonText);
}

export default async function customerConfirmProcessing() {
  const context = await browser.newContext();
  let page;

  try {
    await context.addCookies(authCookies);

    page = await context.newPage();
    await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: 'networkidle' });

    const initialScreen = await waitForAuthenticatedScreen(page, scenario.name, [
      page.getByText('メール分析の結果 - 企業情報の確認'),
    ]);

    if (initialScreen === 'signIn') {
      check(page, {
        [`#${scenario.number} Cookie注入時にログイン画面へ戻されない`]: () => false,
      });
      throw new Error(
        'Cookie注入後もログイン画面が表示されました。Cookieの期限切れ、domain、pathを確認してください。',
      );
    }

    const customerSelectionHeadingIsVisible = await page
      .getByText('メール分析の結果 - 企業情報の確認')
      .isVisible();

    check(page, {
      [`#${scenario.number} 顧客候補確認画面が表示される`]: () =>
        customerSelectionHeadingIsVisible,
    });

    const startedAt = Date.now();

    await clickEnabledButton(page, '確定して次へ');
    await page
      .getByText('メール分析の結果 - 申請内容の確認')
      .waitFor({ state: 'visible', timeout: 120000 });

    scenario13CustomerConfirmProcessingDuration.add(Date.now() - startedAt);

    const applicationReviewHeadingIsVisible = await page
      .getByText('メール分析の結果 - 申請内容の確認')
      .isVisible();

    check(page, {
      [`#${scenario.number} 申請内容確認画面が表示される`]: () =>
        applicationReviewHeadingIsVisible,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
