/* global __ENV */

import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

const applicationId = __ENV.APPLICATION_ID || '1';

export const scenario5ConfirmationMailDraftDuration = new Trend(
  'scenario_5_confirmation_mail_draft_duration',
  true,
);

export const options = {
  scenarios: {
    confirmation_mail_draft_navigation: {
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
    scenario_5_confirmation_mail_draft_duration: ['p(95)<1000'],
  },
};

export default async function confirmationMailDraftNavigation() {
  await runCookieNavigation({
    number: 5,
    name: 'ヒアリングメールドラフト確認画面',
    path: `/scb040101?applicationId=${encodeURIComponent(applicationId)}&missing_field_ids=120`,
    responseTargets: [
      {
        pathname: `/api/applications/${encodeURIComponent(applicationId)}/confirmation-email-draft`,
        method: 'POST',
      },
    ],
    visibleLocators: (page) => [
      page.getByRole('heading', { name: '確認依頼メール作成', level: 2 }),
    ],
    trend: scenario5ConfirmationMailDraftDuration,
  });
}
