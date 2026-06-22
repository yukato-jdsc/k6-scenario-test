import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario2MailRegistrationDuration = new Trend(
  'scenario_2_mail_registration_duration',
  true,
);

export const options = {
  scenarios: {
    mail_registration_navigation: {
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
    scenario_2_mail_registration_duration: ['p(95)<1000'],
  },
};

export default async function mailRegistrationNavigation() {
  await runCookieNavigation({
    number: 2,
    name: 'メール依頼内容登録画面',
    path: '/scb010102',
    responseTargets: [{ pathname: '/scb010102', method: 'GET' }],
    visibleLocators: (page) => [
      page.getByRole('heading', { name: '申込書 - 依頼メール登録', level: 2 }),
    ],
    trend: scenario2MailRegistrationDuration,
  });
}
