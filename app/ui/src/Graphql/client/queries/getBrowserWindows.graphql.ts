import { gql } from '@apollo/client';

export const GET_BROWSER_WINDOWS = gql`
  {
    browserWindows @client {
      id
      key
    }
  }
`;
