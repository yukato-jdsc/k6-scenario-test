import { Trend } from 'k6/metrics';
import { concurrentUsers, runCookieNavigation } from './cookie-navigation.js';

export const scenario9KnowledgeCandidateReviewDuration = new Trend(
  'scenario_9_knowledge_candidate_review_duration',
  true,
);

export const options = {
  scenarios: {
    knowledge_candidate_review_navigation: {
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
    scenario_9_knowledge_candidate_review_duration: ['p(95)<1000'],
  },
};

export default async function knowledgeCandidateReviewNavigation() {
  await runCookieNavigation({
    number: 9,
    name: '経験知マスタ候補確認・修正画面',
    path: '/scg010301',
    visibleLocators: (page) => [
      page.getByRole('heading', { name: '経験知の登録', level: 2 }),
      page.getByText('抽出された経験知'),
    ],
    trend: scenario9KnowledgeCandidateReviewDuration,
  });
}
