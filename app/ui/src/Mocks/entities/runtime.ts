import { GetRunningRuntime_runningRuntime } from '../../Graphql/queries/types/GetRunningRuntime';

export const runtime: GetRunningRuntime_runningRuntime = {
  __typename: 'Runtime',
  id: 'test',
  name: 'Test Name',
  desc: 'Test description',
  labels: ['test', 'label'],
  dockerImage: 'test/image',
  dockerTag: 'testTag',
  runtimePod: 'test pod',
};

export const runtime2: GetRunningRuntime_runningRuntime = {
  __typename: 'Runtime',
  id: 'test 2',
  name: 'Test Name 2',
  desc: 'Test description 2',
  labels: ['test', 'label'],
  dockerImage: 'test/image2',
  dockerTag: 'testTag',
  runtimePod: 'test pod 2',
};
