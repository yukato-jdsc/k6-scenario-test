/* global __ENV */

import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

const applicationId = __ENV.APPLICATION_ID || '1';

export const scenario7SendingMailDraftDuration = new Trend(
  'scenario_7_sending_mail_draft_duration',
  true,
);

export const options = {
  scenarios: {
    sending_mail_draft_navigation: {
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
    scenario_7_sending_mail_draft_duration: ['p(95)<1000'],
  },
};

export default async function sendingMailDraftNavigation() {
  await runCookieNavigation({
    number: 7,
    name: '申込書送付メールドラフト・PDF確認画面',
    path: `/scd010101?applicationId=${encodeURIComponent(applicationId)}`,
    responseTargets: [
      {
        pathname: `/api/applications/${encodeURIComponent(applicationId)}`,
        method: 'GET',
      },
      {
        pathname: `/api/applications/${encodeURIComponent(applicationId)}/pdf`,
        method: 'GET',
      },
    ],
    visibleLocators: (page) => [
      page.getByRole('heading', { name: '申込書送付メール', level: 2 }),
      page.getByRole('heading', { name: '申込書プレビュー', level: 2 }),
    ],
    trend: scenario7SendingMailDraftDuration,
  });
}
