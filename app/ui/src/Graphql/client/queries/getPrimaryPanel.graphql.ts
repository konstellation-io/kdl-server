import { PanelInfo } from '../models/Panel';
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
      theme
      size
    }
  }
`;
