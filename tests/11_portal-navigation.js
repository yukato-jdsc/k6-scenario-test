import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario10PortalDuration = new Trend('scenario_11_portal_duration', true);

export const options = {
  scenarios: {
    portal_navigation: {
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
    scenario_10_portal_duration: ['p(95)<1000'],
  },
};

export default async function portalNavigation() {
  await runCookieNavigation({
    number: 10,
    name: 'ポータルサイト画面',
    path: '/scz020101',
    visibleLocators: (page) => [page.getByText('よく使う項目')],
    trend: scenario10PortalDuration,
  });
}
