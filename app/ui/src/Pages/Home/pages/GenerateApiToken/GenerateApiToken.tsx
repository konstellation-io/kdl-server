import { Button, TextInput } from 'kwc';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import ROUTE, { RouteServerParams, buildRoute } from 'Constants/routes';
import React, { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { ActionButton } from 'Hooks/useStepper/useStepper';
import CodeIcon from '@material-ui/icons/Code';
import DefaultPage from 'Components/Layout/Page/DefaultPage/DefaultPage';
import { GetMe } from 'Graphql/queries/types/GetMe';
import { copyAndToast } from 'Utils/clipboard';
import cx from 'classnames';
import { loader } from 'graphql.macro';
import styles from './GenerateApiToken.module.scss';
import useAPIToken from 'Graphql/hooks/useAPIToken';
import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';

const GetMeQuery = loader('Graphql/queries/getMe.graphql');

type FormData = {
  tokenName: string;
};

function GenerateApiToken() {
  const history = useHistory();
  const { serverId } = useParams<RouteServerParams>();
  const [copied, setCopied] = useState(false);
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  const { data: dataMe } = useQuery<GetMe>(GetMeQuery);

  const {
    addTokenByName,
    add: { data: dataAddToken, loading },
  } = useAPIToken();

  const {
    handleSubmit,
    setValue,
    register,
    unregister,
    errors,
    watch,
    clearErrors,
  } = useForm<FormData>();

  useEffect(() => {
    register('tokenName', { required: 'Please pick a token name' });
    return () => {
      unregister('tokenName');
    };
  }, [register, unregister, setValue]);

  function onSubmit({ tokenName }: FormData) {
    !dataAddToken && addTokenByName(dataMe?.me.id, tokenName);
  }

  function handleCopyButtonClick() {
    if (dataAddToken?.addApiToken?.token) {
      setShowCopyAlert(false);
      setCopied(true);

      copyAndToast(dataAddToken.addApiToken.token);
    }
  }

  function handleAcceptClick() {
    if (copied)
      history.push(buildRoute.server(ROUTE.USER_API_TOKENS, serverId));
    else setShowCopyAlert(true);
  }

  function renderCopyMessage() {
    if (copied)
      return 'Nice, your token is now in your clipboard, remember to store it.';
    if (showCopyAlert && !copied)
      return 'This token will be not accessible again, please copy and save it.';
    return '';
  }

  return (
    <DefaultPage
      title="Please, write a name to generate your API token"
      subtitle="A new API token will be generated labeled with this name. You cannot set a custom token."
      actions={[
        <ActionButton
          key="cancel"
          label="CANCEL"
          to={buildRoute.server(ROUTE.USER_API_TOKENS, serverId)}
        />,
        <ActionButton
          key="accept"
          label="ACCEPT"
          onClick={handleAcceptClick}
          disabled={!dataAddToken}
          primary
        />,
      ]}
    >
      <div className={styles.container}>
        <div className={styles.tokenGenerationContainer}>
          <TextInput
            label="token name"
            placeholder="API token name"
            onChange={(v: string) => {
              setValue('tokenName', v);
              clearErrors('tokenName');
            }}
            error={errors.tokenName?.message || ''}
            onEnterKeyPress={handleSubmit(onSubmit)}
            disabled={!!dataAddToken}
            autoFocus
          />
          <Button
            label="GENERATE"
            Icon={CodeIcon}
            className={styles.generateButton}
            onClick={handleSubmit(onSubmit)}
            disabled={!watch('tokenName')}
            loading={loading}
            success={!!dataAddToken}
            primary
          />
        </div>
        <div className={styles.resultContainer}>
          <TransitionGroup>
            <CSSTransition
              timeout={500}
              key={`${dataAddToken?.addApiToken?.id}`}
              classNames={{
                enter: styles.enter,
              }}
            >
              <>
                {dataAddToken?.addApiToken && (
                  <div className={styles.resultWrapper}>
                    <p className={styles.infoMessage}>
                      API Token cannot be accessed after it has been generated,
                      remember to copy and store the token as soon as it is
                      generated.
                    </p>
                    <div className={styles.token}>
                      <p
                        className={cx(styles.tokenCopied, {
                          [styles.copied]: copied,
                          [styles.notCopied]: showCopyAlert && !copied,
                        })}
                      >
                        {renderCopyMessage()}
                      </p>
                      <span className={styles.label}>YOUR NEW TOKEN</span>
                      <div className={styles.tokenValue}>
                        {dataAddToken.addApiToken.token}
                      </div>
                      <Button
                        label="COPY YOUR TOKEN TO YOUR CLIPBOARD"
                        className={styles.copyButton}
                        onClick={handleCopyButtonClick}
                      />
                    </div>
                  </div>
                )}
              </>
            </CSSTransition>
          </TransitionGroup>
        </div>
      </div>
    </DefaultPage>
  );
}

export default GenerateApiToken;
