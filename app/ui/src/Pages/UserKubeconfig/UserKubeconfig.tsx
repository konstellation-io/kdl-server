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
    if (loading) return <SpinnerCircular size={50} />;
    if (data) {
      return <Kubeconfig kubeconfig={data.kubeconfig} />;
    }
    return;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Kubeconfig</h1>
      <h3 className={styles.subtitle}>
        This is your private kubeconfig. To configure VSCode kubernetes extension, copy this file to
        /home/coder/kubeconfig.
      </h3>
      {getContent()}
    </div>
  );
}

export default UserKubeconfig;
