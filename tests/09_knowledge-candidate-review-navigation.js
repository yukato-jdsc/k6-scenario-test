/* global open */

import encoding from 'k6/encoding';
import { check } from 'k6';
import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { authCookies, baseUrl, concurrentUsers } from './cookie-navigation.js';

const knowledgeFileName = 'knowlegde.xlsx';
const knowledgeFileBytes = open(`../docs/${knowledgeFileName}`, 'b');
const knowledgeFileBase64 = encoding.b64encode(knowledgeFileBytes);
const scenario = {
  number: 9,
  name: '経験知抽出処理',
  path: '/scg010101',
};

export const scenario9KnowledgeExtractionProcessingDuration = new Trend(
  'scenario_9_knowledge_extraction_processing_duration',
  true,
);

export const options = {
  scenarios: {
    knowledge_extraction_processing: {
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
    scenario_9_knowledge_extraction_processing_duration: ['p(95)<1000'],
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

async function dropKnowledgeFile(page) {
  await page.evaluate(
    ({ base64, fileName }) => {
      const uploadTarget = Array.from(
        document.querySelectorAll('[class*="cursor-pointer"]'),
      ).find((element) =>
        element.textContent.includes('クリックしてアップロード'),
      );

      if (!uploadTarget) {
        throw new Error('経験知アップロードエリアが見つかりませんでした');
      }

      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }

      const file = new File([bytes], fileName, {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
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
    { base64: knowledgeFileBase64, fileName: knowledgeFileName },
  );
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

function waitForKnowledgeExtractionResponse(page) {
  return page.waitForResponse(/\/api\/knowledges\/extract\/?(?:[?#].*)?$/, {
    timeout: 120000,
  });
}

export default async function knowledgeExtractionProcessing() {
  const context = await browser.newContext();
  let page;

  try {
    await context.addCookies(authCookies);

    page = await context.newPage();
    await page.goto(`${baseUrl}${scenario.path}`, { waitUntil: 'networkidle' });

    const initialScreen = await waitForAuthenticatedScreen(
      page,
      scenario.name,
      [page.getByText('経験知登録'), page.getByText('引継書をアップロード')],
    );

    if (initialScreen === 'signIn') {
      check(page, {
        [`#${scenario.number} Cookie注入時にログイン画面へ戻されない`]: () =>
          false,
      });
      throw new Error(
        'Cookie注入後もログイン画面が表示されました。Cookieの期限切れ、domain、pathを確認してください。',
      );
    }

    await dropKnowledgeFile(page);
    await page
      .getByText(knowledgeFileName)
      .waitFor({ state: 'visible', timeout: 120000 });

    const knowledgeFileNameIsVisible = await page
      .getByText(knowledgeFileName)
      .isVisible();
    check(page, {
      [`#${scenario.number} 経験知ファイル名が表示される`]: () =>
        knowledgeFileNameIsVisible,
    });

    const startedAt = Date.now();
    const extractionResponsePromise = waitForKnowledgeExtractionResponse(page);

    await clickEnabledButton(page, '経験知を抽出');
    await extractionResponsePromise;

    scenario9KnowledgeExtractionProcessingDuration.add(Date.now() - startedAt);

    await page
      .getByText('抽出された経験知')
      .waitFor({ state: 'visible', timeout: 120000 });

    const knowledgeRegistrationHeadingIsVisible = await page
      .getByRole('heading', { name: '経験知の登録', level: 2 })
      .isVisible();
    const extractedKnowledgeHeadingIsVisible = await page
      .getByText('抽出された経験知')
      .isVisible();

    check(page, {
      [`#${scenario.number} 経験知登録画面が表示される`]: () =>
        knowledgeRegistrationHeadingIsVisible,
      [`#${scenario.number} 抽出された経験知が表示される`]: () =>
        extractedKnowledgeHeadingIsVisible,
    });
  } finally {
    if (page) {
      await page.close();
    }
    await context.close();
  }
}
