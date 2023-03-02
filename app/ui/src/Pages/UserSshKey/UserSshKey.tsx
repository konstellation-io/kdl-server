import { ErrorMessage, SpinnerCircular } from 'kwc';
import FAQBox, { BOX_THEME } from './components/FAQBox/FAQBox';

import { GetSSHKey } from 'Graphql/queries/types/GetSSHKey';
import * as React from 'react';
import SSHKey from './components/SSHKey/SSHKey';
import { copyAndToast } from 'Utils/clipboard';
import styles from './UserSshKey.module.scss';
import { toast } from 'react-toastify';
import { useQuery, useReactiveVar } from '@apollo/client';
import useSSHKey from 'Graphql/hooks/useSSHKey';

import GetSSHKeys from 'Graphql/queries/getSSHKey';
import { runningRuntime } from 'Graphql/client/cache';
import UserPageHeader from 'Components/UserPageHeader/UserPageHeader';

function UserSshKey() {
  const { data, loading, error } = useQuery<GetSSHKey>(GetSSHKeys);
  const {
    regenerateSSHKey: { performMutation: regenerateSSHKey, loading: regenerateSSHKeyLoading },
  } = useSSHKey({
    onRegenerateSSHKeyComplete: () => {
      toast.info('SSH Key has been regenerated');
      toast.clearWaitingQueue();
    },
  });

  const runtimeRunning = useReactiveVar(runningRuntime);

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (error || !data) return <ErrorMessage />;

    const {
      me: { sshKey },
    } = data;

    return (
      <>
        <div className={styles.key}>
          <SSHKey sshKey={sshKey} />
        </div>
        <div className={styles.faqs}>
          <h2>If you need some help, check this</h2>
          <div className={styles.box}>
            <FAQBox
              label="What is the SSH key for?"
              title="User SSH key."
              description="Every user connected to this server has an automatically generated SSH Key.
                This key is unique for your user and will help outside-the-server applications
                to verify that you are the user performing operations. In order to make this
                possible, you need to copy the key shown above and paste it inside the SSH Keys section
                (usually in user settings) of the application you want to be verified from.
                Tipically this will be done in version-control systems, such as GitHub or Gitea."
            />
          </div>
          <div className={styles.box}>
            <FAQBox
              label="How may I upload this SSH key to a repository?"
              title="Uploading an SSH Key to a repository."
              description="In order to upload your SSH Key to a repository, you need to access the application
                and go to settings and look for the SSH Section (it might be within Security or Authentication
                settings). You do not need to be inside a project, general settings should show this section. Once
                you are there, you will be able to upload a new key. Name the key as you prefer, paste it and save."
            />
          </div>
          <div className={styles.box}>
            <FAQBox
              label="I want to change my SSH key"
              title="Generate a new SSH Key."
              theme={BOX_THEME.ERROR}
              description="In case you have leaked your private SSH key or for any other reason you want to generate a new one,
                you can generate a new one by clicking on the 'REGENERATE' button bellow (note you must confirm this
                action). You will not be able to access repositories with the old SSH Key, and you cannot recover previous
                SSH keys, so be sure to update the key on all the services you will continue using."
              customAction={
                runtimeRunning ? (
                  <div className={styles.regenWarning}>
                    <div className={styles.regenWarningTag}>WARNING:</div>
                    <div className={styles.regenWarningText}>
                      User tools are running, you need to stop them in order to regenerate the SSH Key.
                    </div>
                  </div>
                ) : undefined
              }
              action={{
                needConfirmation: true,
                message: 'Sure, I will do it.',
                label: 'Regenerate',
                onClick: regenerateSSHKey,
                loading: regenerateSSHKeyLoading,
              }}
            />
          </div>
          <FAQBox
            label="Where can I find my private SSH Key?"
            title="Copy private SSH Key."
            description="In case you want to get you private key (for instance, you might want to use your machine to be authorized
              with this key) you can copy it to your clipboard by clicking on the button bellow. Do not share this key with
              anyone, it is used to let applications know you are the one performing actions so only you should be using this
              key."
            theme={BOX_THEME.WARN}
            action={{
              label: 'Copy private key',
              onClick: () => copyAndToast(sshKey.private),
            }}
          />
        </div>
      </>
    );
  }

  return (
    <div className={styles.container}>
      <UserPageHeader title={'SSH Key'} />
      <h3 className={styles.subtitle}>
        This is your private SSH key, to grant access for your user to a project repository, copy the key and include it
        inside the SSH keys section of the repository settings page.
      </h3>
      {getContent()}
    </div>
  );
}

export default UserSshKey;
