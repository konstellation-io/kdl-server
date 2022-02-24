import { SpinnerCircular } from 'kwc';
import * as React from 'react';
import styles from './UserKubeconfig.module.scss';
import { useQuery } from '@apollo/client';
import getKubeconfig from 'Graphql/queries/getKubeconfig';
import Kubeconfig from './Components/Kubeconfig';
import { GetKubeconfig } from 'Graphql/queries/types/GetKubeconfig';

function UserKubeconfig() {
  const { data, loading } = useQuery<GetKubeconfig>(getKubeconfig);

  function getContent() {
    if (loading) return <SpinnerCircular />;
    if (data) {
      return <Kubeconfig kubeconfig={data.kubeconfig} />;
    }
    return;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kubeconfig</h1>
      <h3 className={styles.subtitle}>
        This is your private kubeconfig. You can use it to connect your local VSCode to the runtime via the Kubernetes
        extension in VSCode.
        <p>
          <ol>
            <li>Download the kube config and configure it in the Kubernetes extension.</li>
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
