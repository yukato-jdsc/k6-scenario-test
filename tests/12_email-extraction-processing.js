/* global open */

import encoding from 'k6/encoding';
import { check } from 'k6';
import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { authCookies, baseUrl, concurrentUsers } from './cookie-navigation.js';

const sampleMailFileName = 'sample.eml';
const sampleMailBytes = open(`../docs/${sampleMailFileName}`, 'b');
const sampleMailBase64 = encoding.b64encode(sampleMailBytes);
const scenario = {
  number: 12,
  name: '依頼メール登録①：EML情報抽出処理',
  path: '/scb010102',
};

export const scenario12EmailExtractionProcessingDuration = new Trend(
  'scenario_12_email_extraction_processing_duration',
  true,
);

export const options = {
  scenarios: {
    email_extraction_processing: {
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
    scenario_12_email_extraction_processing_duration: ['p(95)<120000'],
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

async function dropSampleMailFile(page) {
  await page.evaluate(
    ({ base64, fileName }) => {
      const uploadTarget = Array.from(document.querySelectorAll('[class*="cursor-pointer"]')).find(
        (element) => element.textContent.includes('クリックしてアップロード'),
      );

      if (!uploadTarget) {
        throw new Error('EMLアップロードエリアが見つかりませんでした');
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const file = new File([bytes], fileName, { type: 'message/rfc822' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      for (const eventName of ['dragenter', 'dragover', 'drop']) {
        uploadTarget.dispatchEvent(
          new DragEvent(eventName, {
            bubbles: true,
            cancelable: true,
            dataTransfer,
          }),
        );
      }
    },
    { base64: sampleMailBase64, fileName: sampleMailFileName },
  );
}

async function waitForEnabledRegisterButton(page, timeout = 120000) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const isEnabled = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).some(
        (button) => button.textContent.trim() === '登録' && !button.disabled,
      ),
    );

    if (isEnabled) {
      return;
    }

    await page.waitForTimeout(100);
  }

  throw new Error('クリック可能な登録ボタンが表示されませんでした');
}

async function clickEnabledRegisterButton(page) {
  await waitForEnabledRegisterButton(page);

  await page.evaluate(() => {
    const registerButton = Array.from(document.querySelectorAll('button')).find(
      (button) => button.textContent.trim() === '登録' && !button.disabled,
    );

    if (!registerButton) {
      throw new Error('クリック可能な登録ボタンが見つかりませんでした');
    }

    registerButton.click();
  });
}

export default async function emailExtractionProcessing() {
  const context = await browser.newContext();
  let page;

  try {
    await context.addCookies(authCookies);

    page = await context.newPage();

    await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: 'networkidle' });

    const initialScreen = await waitForAuthenticatedScreen(page, scenario.name, [
      page.getByRole('heading', { name: '申込書 - 依頼メール登録', level: 2 }),
    ]);

    if (initialScreen === 'signIn') {
      check(page, {
        [`#${scenario.number} Cookie注入時にログイン画面へ戻されない`]: () => false,
      });
      throw new Error(
        'Cookie注入後もログイン画面が表示されました。Cookieの期限切れ、domain、pathを確認してください。',
      );
    }

    await dropSampleMailFile(page);
    await page.getByText(sampleMailFileName).waitFor({ state: 'visible', timeout: 120000 });

    const sampleMailFileNameIsVisible = await page.getByText(sampleMailFileName).isVisible();
    check(page, {
      [`#${scenario.number} EMLアップロード後にファイル名が表示される`]: () =>
        sampleMailFileNameIsVisible,
    });

    await clickEnabledRegisterButton(page);
    await page.getByText('メール内容（確認・編集）').waitFor({ state: 'visible', timeout: 120000 });

    const editHeadingIsVisible = await page.getByText('メール内容（確認・編集）').isVisible();
    const formValues = await page.evaluate(() => {
      const textarea = document.querySelector('textarea');

      return {
        inputs: Array.from(document.querySelectorAll('input')).map((input) => input.value),
        textarea: textarea ? textarea.value : '',
      };
    });

    check(page, {
      [`#${scenario.number} メール内容（確認・編集）が表示される`]: () => editHeadingIsVisible,
      [`#${scenario.number} サンプルメールの差出人が入力される`]: () =>
        formValues.inputs.includes('hanako.tanaka@example.com'),
      [`#${scenario.number} サンプルメールの本文が入力される`]: () =>
        formValues.textarea.includes('東亜テクノロジーズ株式会社'),
    });

    const startedAt = Date.now();

    await clickEnabledRegisterButton(page);
    await page
      .getByText('メール分析の結果 - 企業情報の確認')
      .waitFor({ state: 'visible', timeout: 120000 });

    scenario12EmailExtractionProcessingDuration.add(Date.now() - startedAt);

    const customerSelectionHeadingIsVisible = await page
      .getByText('メール分析の結果 - 企業情報の確認')
      .isVisible();

    check(page, {
      [`#${scenario.number} 顧客候補確認画面が表示される`]: () =>
        customerSelectionHeadingIsVisible,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
