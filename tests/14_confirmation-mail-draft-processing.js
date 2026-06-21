/* global __ENV */

import { check } from 'k6';
import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { authCookies, baseUrl, concurrentUsers } from './cookie-navigation.js';

const applicationId = __ENV.APPLICATION_ID || '6';
const scenario = {
  number: 14,
  name: '確認依頼メール作成処理',
  path: `/scc010501?applicationId=${encodeURIComponent(applicationId)}`,
};

export const scenario14ConfirmationMailDraftProcessingDuration = new Trend(
  'scenario_14_confirmation_mail_draft_processing_duration',
  true,
);

export const options = {
  scenarios: {
    confirmation_mail_draft_processing: {
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
    scenario_14_confirmation_mail_draft_processing_duration: ['p(95)<120000'],
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

async function waitForTextPresence(page, text, shouldBePresent, timeout = 120000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const isPresent = await page.evaluate((targetText) => document.body.textContent.includes(targetText), text);

    if (isPresent === shouldBePresent) {
      return;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(
    `${text} が ${shouldBePresent ? '表示' : '非表示'} になるまでにタイムアウトしました`,
  );
}

async function textIsPresent(page, text) {
  return page.evaluate((targetText) => document.body.textContent.includes(targetText), text);
}

export default async function confirmationMailDraftProcessing() {
  const context = await browser.newContext();
  let page;

  try {
    await context.addCookies(authCookies);

    page = await context.newPage();
    await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: 'networkidle' });

    const initialScreen = await waitForAuthenticatedScreen(page, scenario.name, [
      page.getByText('メール分析の結果 - 申請内容の確認'),
    ]);

    if (initialScreen === 'signIn') {
      check(page, {
        [`#${scenario.number} Cookie注入時にログイン画面へ戻されない`]: () => false,
      });
      throw new Error(
        'Cookie注入後もログイン画面が表示されました。Cookieの期限切れ、domain、pathを確認してください。',
      );
    }

    const applicationReviewHeadingIsVisible = await page
      .getByText('メール分析の結果 - 申請内容の確認')
      .isVisible();

    check(page, {
      [`#${scenario.number} 申請内容確認画面が表示される`]: () =>
        applicationReviewHeadingIsVisible,
    });

    const startedAt = Date.now();

    await clickEnabledButton(page, '確認依頼メールを作成');

    const loadingSpinnerText = '確認メールドラフトを作成中';
    await waitForTextPresence(page, loadingSpinnerText, true);

    const spinnerIsVisible = await textIsPresent(page, loadingSpinnerText);
    check(page, {
      [`#${scenario.number} 確認メールドラフト作成中スピナーが表示される`]: () =>
        spinnerIsVisible,
    });

    await waitForTextPresence(page, loadingSpinnerText, false);

    scenario14ConfirmationMailDraftProcessingDuration.add(Date.now() - startedAt);

    const confirmationMailDraftHeadingIsVisible = await page
      .getByRole('heading', { name: '確認依頼メール作成', level: 2 })
      .isVisible();
    const draftBodyIsVisible = await page.getByText('確認メールドラフト').isVisible();
    const spinnerIsHidden = !(await textIsPresent(page, loadingSpinnerText));

    check(page, {
      [`#${scenario.number} 確認依頼メール作成画面が表示される`]: () =>
        confirmationMailDraftHeadingIsVisible,
      [`#${scenario.number} 確認メールドラフトが表示される`]: () => draftBodyIsVisible,
      [`#${scenario.number} 確認メールドラフト作成中スピナーが消える`]: () =>
        spinnerIsHidden,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
