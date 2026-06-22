/* global __ENV */

import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

const applicationId = __ENV.APPLICATION_ID || '1';

export const scenario4CustomerSelectionDuration = new Trend(
  'scenario_4_customer_selection_duration',
  true,
);

export const options = {
  scenarios: {
    customer_selection_navigation: {
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
    scenario_4_customer_selection_duration: ['p(95)<1000'],
  },
};

export default async function customerSelectionNavigation() {
  await runCookieNavigation({
    number: 4,
    name: '顧客候補確認・選択画面',
    path: `/scb020101?applicationId=${encodeURIComponent(applicationId)}`,
    responseTargets: [
      {
        pathname: `/api/applications/${encodeURIComponent(applicationId)}`,
        method: 'GET',
      },
      {
        pathname: `/api/applications/${encodeURIComponent(applicationId)}/bfs-entries`,
        method: 'GET',
      },
    ],
    visibleLocators: (page) => [
      page.getByText('メール分析の結果 - 企業情報の確認'),
    ],
    trend: scenario4CustomerSelectionDuration,
  });
}
