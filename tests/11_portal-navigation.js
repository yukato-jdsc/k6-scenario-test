import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario11PortalDuration = new Trend(
  'scenario_11_portal_duration',
  true,
);

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
    scenario_11_portal_duration: ['p(95)<1000'],
  },
};

export default async function portalNavigation() {
  await runCookieNavigation({
    number: 11,
    name: 'ポータルサイト画面',
    path: '/scz020101',
    responseTargets: [{ pathname: '/scz020101', method: 'GET' }],
    visibleLocators: (page) => [page.getByText('よく使う項目')],
    trend: scenario11PortalDuration,
  });
}
