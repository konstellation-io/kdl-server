import { PanelInfo } from 'Pages/Home/apollo/models/Panel';
import { gql } from '@apollo/client';

export interface GetPrimaryPanel {
  primaryPanel: PanelInfo;
}

export const GET_PRIMARY_PANEL = gql`
  {
    primaryPanel @client {
      id
      title
      fixedWidth
      isDark
      size
    }
  }
`;
