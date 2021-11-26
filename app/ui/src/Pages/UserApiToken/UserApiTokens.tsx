import { Button, ErrorMessage, SpinnerCircular } from 'kwc';
import ROUTE from 'Constants/routes';

import { GetMe } from 'Graphql/queries/types/GetMe';
import Message from 'Components/Message/Message';
import * as React from 'react';
import Token from './components/token/Token';
import styles from './UserApiTokens.module.scss';
import useAPIToken from 'Graphql/hooks/useAPIToken';
import { useQuery } from '@apollo/client';

import GetMeQuery from 'Graphql/queries/getMe';

function UserApiTokens() {
  const { data, loading, error } = useQuery<GetMe>(GetMeQuery);
  const { removeApiTokenById } = useAPIToken();

  function renderMainContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;

    if (!data.me.apiTokens) return <Message text="There are not tokens yet" />;

    return data.me.apiTokens.map(({ name, lastUsedDate, creationDate, id }) => (
      <Token
        key={id}
        name={name}
        creationDate={creationDate}
        lastUsedDate={lastUsedDate}
        removeToken={() => removeApiTokenById(id)}
      />
    ));
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>API Tokens</h1>
      <div className={styles.infoContainer}>
        <p className={styles.infoMessage}>
          These are you API Tokens, use them to be authorized through API Token auth.
        </p>
        <Button
          label="GENERATE"
          className={styles.generateButton}
          height={30}
          to={ROUTE.GENERATE_USER_API_TOKEN}
          border
        />
      </div>
      <div className={styles.tokensContainer}>{renderMainContent()}</div>
    </div>
  );
}

export default UserApiTokens;
