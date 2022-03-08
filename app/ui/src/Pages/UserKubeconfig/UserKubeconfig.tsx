import { Button, BUTTON_ALIGN, SpinnerCircular } from 'kwc';
import * as React from 'react';
import styles from './UserKubeconfig.module.scss';
import { useQuery } from '@apollo/client';
import getKubeconfig from 'Graphql/queries/getKubeconfig';
import Kubeconfig from './Components/Kubeconfig';
import { GetKubeconfig } from 'Graphql/queries/types/GetKubeconfig';
import { useHistory } from 'react-router-dom';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import UserPageHeader from '../../Components/UserPageHeader/UserPageHeader';

function UserKubeconfig() {
  const { data, loading } = useQuery<GetKubeconfig>(getKubeconfig);

  const history = useHistory();

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (data) {
      return <Kubeconfig kubeconfig={data.kubeconfig} />;
    }
    return;
  }

  return (
    <div className={styles.container}>
      {/*<div className={styles.containerHeader}>*/}
      {/*<Button*/}
      {/*  Icon={ArrowBackIcon}*/}
      {/*  onClick={goBack}*/}
      {/*  label=""*/}
      {/*  iconSize={'icon-regular'}*/}
      {/*  align={BUTTON_ALIGN.MIDDLE}*/}
      {/*  className={styles.goBackButton}*/}
      {/*/>*/}
      {/*  <ArrowBackIcon onClick={goBack} className={styles.goBackButton} fontSize="small" />*/}
      {/*  <h1 className={styles.title}>Kubeconfig</h1>*/}
      {/*</div>*/}
      <UserPageHeader title={'Kubeconfig'} />
      <h3 className={styles.subtitle}>
        This is your private kubeconfig. You can use it to connect your local VSCode to the runtime via the Kubernetes
        extension in VSCode.
        <p>
          <ol>
            <li>
              Install the{' '}
              <a
                target="_blank"
                href="https://marketplace.visualstudio.com/items?itemName=ms-kubernetes-tools.vscode-kubernetes-tools"
                rel="noreferrer"
                className={styles.link}
              >
                Kubernetes Extension.
              </a>
            </li>
            <li>
              Install the{' '}
              <a
                target="_blank"
                href="https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.vscode-remote-extensionpack"
                rel="noreferrer"
                className={styles.link}
              >
                Remote Development Extension Pack.
              </a>
            </li>
            <li>Download the kube config shown in this page.</li>
            <li>
              Move the downloaded kube config file to <span className={styles.highlight}>~/.kube/config</span>
            </li>
            <li>Configure the kube config file in the kubernetes extension.</li>
            <li>In the kubernetes extension, navigate to &ldquo;Workloads &gt; Pods&ldquo;</li>
            <li>
              Locate the runtime pod named <span className={styles.highlight}>usertools-#USERNAME#-user-tools-0</span>,
              and right click on it &gt; &ldquo;Attach Visual Studio Code&ldquo;
            </li>
            <li>
              Then attach your VSCode to the container named{' '}
              <span className={styles.highlight}>user-tools-vscode-runtime</span>
            </li>
          </ol>
        </p>
      </h3>
      {getContent()}
    </div>
  );
}

export default UserKubeconfig;
