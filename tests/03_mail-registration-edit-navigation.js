import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario3MailRegistrationEditDuration = new Trend(
  'scenario_3_mail_registration_edit_duration',
  true,
);

export const options = {
  scenarios: {
    mail_registration_edit_navigation: {
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
    scenario_3_mail_registration_edit_duration: ['p(95)<1000'],
  },
};

export default async function mailRegistrationEditNavigation() {
  await runCookieNavigation({
    number: 3,
    name: 'メール依頼内容登録画面（確認・編集）',
    path: '/scb010102-edit',
    responseTargets: [{ pathname: '/scb010102-edit', method: 'GET' }],
    visibleLocators: (page) => [page.getByText('メール内容（確認・編集）')],
    trend: scenario3MailRegistrationEditDuration,
  });
}
