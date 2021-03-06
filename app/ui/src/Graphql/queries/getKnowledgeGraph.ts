import { gql } from '@apollo/client';

export default gql`
  query GetKnowledgeGraph($projectId: ID!) {
    knowledgeGraph(projectId: $projectId) {
      items {
        id
        category
        title
        abstract
        authors
        score
        date
        url
        starred
        frameworks
        repoUrls
        topics {
          name
          relevance
        }
      }
      topics {
        name
        relevance
      }
    }
  }
`;
