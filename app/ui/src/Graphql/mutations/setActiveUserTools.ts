import { gql } from '@apollo/client';

export default gql`
  mutation SetActiveUserTools($input: SetActiveUserToolsInput!) {
    setActiveUserTools(input: $input) {
      id
      areToolsActive
    }
  }
`;
