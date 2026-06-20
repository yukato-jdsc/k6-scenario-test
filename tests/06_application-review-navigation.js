/* global __ENV */

import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

const applicationId = __ENV.K6_APPLICATION_ID || '1';

export const scenario6ApplicationReviewDuration = new Trend(
  'scenario_6_application_review_duration',
  true,
);

export const options = {
  scenarios: {
    application_review_navigation: {
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
    scenario_6_application_review_duration: ['p(95)<1000'],
  },
};

export default async function applicationReviewNavigation() {
  await runCookieNavigation({
    number: 6,
    name: '申込書作成・入力項目一覧画面',
    path: `/scc010501?applicationId=${encodeURIComponent(applicationId)}`,
    visibleLocators: (page) => [page.getByText('メール分析の結果 - 申請内容の確認')],
    trend: scenario6ApplicationReviewDuration,
  });
}
