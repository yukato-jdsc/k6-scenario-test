import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario7KnowledgeRegistrationDuration = new Trend(
  'scenario_8_knowledge_registration_duration',
  true,
);

export const options = {
  scenarios: {
    knowledge_registration_navigation: {
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
    scenario_7_knowledge_registration_duration: ['p(95)<1000'],
  },
};

export default async function knowledgeRegistrationNavigation() {
  await runCookieNavigation({
    number: 7,
    name: '経験知登録画面',
    path: '/scg010101',
    visibleLocators: (page) => [page.getByText('引継書をアップロード')],
    trend: scenario7KnowledgeRegistrationDuration,
  });
}
