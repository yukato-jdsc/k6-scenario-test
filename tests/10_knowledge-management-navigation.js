import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario10KnowledgeManagementDuration = new Trend(
  'scenario_10_knowledge_management_duration',
  true,
);

export const options = {
  scenarios: {
    knowledge_management_navigation: {
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
    scenario_10_knowledge_management_duration: ['p(95)<1000'],
  },
};

export default async function knowledgeManagementNavigation() {
  await runCookieNavigation({
    number: 10,
    name: '経験知DB閲覧・編集画面',
    path: '/scg010302',
    responseTargets: [{ pathname: '/api/knowledges/grouped', method: 'GET' }],
    visibleLocators: (page) => [
      page.getByRole('heading', { name: '経験知管理', level: 1 }),
    ],
    trend: scenario10KnowledgeManagementDuration,
  });
}
