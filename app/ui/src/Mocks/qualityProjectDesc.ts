import { MockedResponse } from '@apollo/client/testing';
import { loader } from 'graphql.macro';

const GetQualityProjectDescQuery = loader(
  'Graphql/queries/getQualityProjectDesc.graphql'
);
export const skipFirstCall = 'skipFirstCall';
export const mockSkipResult = jest.fn();
export const firstCall = 'firstCall';
export const response = {
  data: {
    qualityProjectDesc: { quality: 100 },
  },
};

export const mocks: MockedResponse[] = [
  {
    request: {
      query: GetQualityProjectDescQuery,
      variables: {
        description: skipFirstCall,
      },
    },
    result: () => {
      mockSkipResult();
      return response;
    },
  },
];
