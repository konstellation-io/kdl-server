import { PanelInfo } from 'Pages/Home/apollo/models/Panel';
import { gql } from '@apollo/client';

export interface GetSecondaryPanel {
  secondaryPanel: PanelInfo;
}

export const GET_SECONDARY_PANEL = gql`
  {
    secondaryPanel @client {
      id
      title
      fixedWidth
      isDark
      size
    }
  }
`;
