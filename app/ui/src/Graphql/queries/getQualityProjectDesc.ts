import { gql } from '@apollo/client';

export default gql`
  query GetQualityProjectDesc($description: String!) {
    qualityProjectDesc(description: $description) {
      quality
    }
  }
`;
