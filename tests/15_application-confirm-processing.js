/* global __ENV */

import { check } from 'k6';
import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { authCookies, baseUrl, concurrentUsers } from './cookie-navigation.js';

const applicationId = __ENV.K6_APPLICATION_ID || __ENV.APPLICATION_ID || '6';
const localValidationOnly = __ENV.K6_LOCAL_VALIDATION_ONLY === 'true';
const scenario = {
  number: 15,
  name: '申請確定処理',
  path: `/scc010501?applicationId=${encodeURIComponent(applicationId)}`,
};

export const scenario15ApplicationConfirmProcessingDuration = new Trend(
  'scenario_15_application_confirm_processing_duration',
  true,
);

export const options = {
  scenarios: {
    application_confirm_processing: {
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
    scenario_15_application_confirm_processing_duration: ['p(95)<120000'],
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

async function textIsPresent(page, text) {
  return page.evaluate((targetText) => document.body.textContent.includes(targetText), text);
}

async function waitForAnyText(page, texts, timeout = 120000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const matchedText = await page.evaluate(
      (targetTexts) =>
        targetTexts.find((targetText) => document.body.textContent.includes(targetText)) || null,
      texts,
    );

    if (matchedText) {
      return matchedText;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`${texts.join(' / ')} のいずれも表示されませんでした`);
}

async function waitForApplicationConfirmResult(page, timeout = 120000) {
  const deadline = Date.now() + timeout;
  const successTexts = ['申込書送付メール', '申込書プレビュー'];
  const failureText = '申請の確定に失敗しました';

  while (Date.now() < deadline) {
    const result = await page.evaluate(
      ({ successTargets, failureTarget }) => {
        const bodyText = document.body.textContent;

        if (bodyText.includes(failureTarget)) {
          return 'failure';
        }

        if (successTargets.some((targetText) => bodyText.includes(targetText))) {
          return 'success';
        }

        return null;
      },
      { successTargets: successTexts, failureTarget: failureText },
    );

    if (result) {
      return result;
    }

    await page.waitForTimeout(100);
  }

  throw new Error(`${successTexts.join(' / ')} または ${failureText} が表示されませんでした`);
}

export default async function applicationConfirmProcessing() {
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

    await clickEnabledButton(page, 'この内容で申請を確定');

    const modalText = await waitForAnyText(page, ['必須項目の未入力', '申請内容の確定']);

    if (modalText === '必須項目の未入力') {
      const validationModalIsVisible = await textIsPresent(page, '必須項目の未入力');

      check(page, {
        [`#${scenario.number} 必須項目の未入力モーダルが表示される`]: () =>
          validationModalIsVisible && localValidationOnly,
      });

      if (!localValidationOnly) {
        throw new Error(
          '必須項目の未入力が表示されました。申請確定処理の測定には必須項目が入力済みのapplicationIdを指定してください。',
        );
      }

      return;
    }

    if (localValidationOnly) {
      check(page, {
        [`#${scenario.number} 必須項目の未入力モーダルが表示される`]: () => false,
      });
      throw new Error(
        'ローカル確認モードでは必須項目の未入力モーダルのみ確認しますが、申請内容の確定モーダルが表示されました。',
      );
    }

    const confirmModalIsVisible = await textIsPresent(page, '申請内容の確定');
    const confirmButtonIsVisible = await textIsPresent(page, '申請を確定');

    check(page, {
      [`#${scenario.number} 申請内容の確定モーダルが表示される`]: () =>
        confirmModalIsVisible,
      [`#${scenario.number} 申請を確定ボタンが表示される`]: () => confirmButtonIsVisible,
    });

    const startedAt = Date.now();

    await clickEnabledButton(page, '申請を確定');
    const confirmResult = await waitForApplicationConfirmResult(page);

    if (confirmResult === 'failure') {
      check(page, {
        [`#${scenario.number} 申請の確定に失敗しましたトーストが表示されない`]: () =>
          false,
      });
      throw new Error('申請の確定に失敗しましたトーストが表示されました');
    }

    scenario15ApplicationConfirmProcessingDuration.add(Date.now() - startedAt);

    const sendingMailDraftHeadingIsVisible = await textIsPresent(page, '申込書送付メール');
    const applicationPreviewHeadingIsVisible = await textIsPresent(page, '申込書プレビュー');

    check(page, {
      [`#${scenario.number} 申込書送付メール画面が表示される`]: () =>
        sendingMailDraftHeadingIsVisible || applicationPreviewHeadingIsVisible,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
