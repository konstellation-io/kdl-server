import React from 'react';
import { mount } from 'enzyme';
import { MockedProvider } from '@apollo/client/testing';
import useQualityDescription from './useQualityDescription';
import { act, waitFor } from '@testing-library/react';
import {
  mocks,
  mockSkipResult,
  skipFirstCall,
  response,
} from 'Mocks/qualityProjectDesc';

const HookWrapper = ({ hook }) => <div hook={hook()} />;
const wait = async () => await waitFor(() => {});

function buildWrapper(description, options = {}) {
  return mount(
    <MockedProvider mocks={mocks} addTypename={false}>
      <HookWrapper hook={() => useQualityDescription(description, options)} />
    </MockedProvider>
  );
}

describe('useQualityDescription hook', () => {
  it('should skip the first call by default', async () => {
    // Arrange.
    // Act.
    await act(async () => {
      buildWrapper(skipFirstCall);
      await wait();
    });
    await wait();
    // Assert.
    expect(mockSkipResult).not.toHaveBeenCalled();
  });

  it('should call the query if skipFirstCall is false', async () => {
    // Arrange.
    let wrapper;
    // Act.
    await act(async () => {
      wrapper = buildWrapper(skipFirstCall, { skipFirstRun: false });
      await wait();
    });
    await wait();
    // Assert.
    expect(mockSkipResult).toHaveBeenCalled();
  });
});
