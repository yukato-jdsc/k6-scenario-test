import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario1ApplicationListDuration = new Trend(
  'scenario_1_application_list_duration',
  true,
);

export const options = {
  scenarios: {
    application_list_navigation: {
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
    scenario_1_application_list_duration: ['p(95)<1000'],
  },
};

export default async function applicationListNavigation() {
  await runCookieNavigation({
    number: 1,
    name: '申込書作成案件一覧画面',
    path: '/scb010101',
    visibleLocators: (page) => [page.getByRole('heading', { name: '申込書一覧', level: 1 })],
    trend: scenario1ApplicationListDuration,
  });
}
