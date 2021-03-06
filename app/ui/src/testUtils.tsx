import React from 'react';
import { ApolloClient, ApolloProvider } from '@apollo/client';
import { render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';

export async function wait(ms = 0) {
  await act(() => new Promise((resolve) => setTimeout(resolve, ms)));
}

export async function apolloRender(
  component: JSX.Element,
  client: ApolloClient<any>
) {
  render(<ApolloProvider client={client}>{component}</ApolloProvider>);

  await wait();
}

// @ts-ignore
const HookWrapper = ({ hook }: any) => <div hook={hook()} />;

export async function apolloHookRender(
  hook: Function,
  client: ApolloClient<any>
) {
  const wrapper = mount(
    <ApolloProvider client={client}>
      <HookWrapper hook={hook} />
    </ApolloProvider>
  );

  await wait();

  // @ts-ignore
  return wrapper.find('div').props().hook;
}

export const loadingHandler = () =>
  new Promise(() => {
    // This is intentional
  });
export const dataHandler = (data: any) => () => Promise.resolve({ data });
export const errorHandler = (error: string) => () => Promise.reject({ error });

export function getSnapshot() {
  return document.querySelector('body');
}

export const ERROR_MESSAGE =
  'Something went wrong, refresh the page or try again later.';
