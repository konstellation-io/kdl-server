import { Button } from 'kwc';
import * as React from 'react';
import { copyAndToast } from 'Utils/clipboard';
import styles from './Kubeconfig.module.scss';
import IconFileCopy from '@material-ui/icons/FileCopy';
import IconGetApp from '@material-ui/icons/GetApp';

type Props = {
  kubeconfig: string;
};

function downloadFile(text: string) {
  const element = document.createElement('a');
  const file = new Blob([text], {
    type: 'text/yaml',
  });
  element.href = URL.createObjectURL(file);
  element.download = 'kubeconfig';
  document.body.appendChild(element);
  element.click();
}

function Kubeconfig({ kubeconfig }: Props) {
  console.log(kubeconfig);
  return (
    <div className={styles.container} data-testid="kubeconfig">
      <div className={styles.kubeconfig}>{kubeconfig.trim()}</div>
      <div className={styles.buttonsContainer} data-testid="kubeconfigButtons">
        <Button Icon={IconFileCopy} label="" className={styles.button} onClick={() => copyAndToast(kubeconfig)} />
        <Button Icon={IconGetApp} label="" className={styles.button} onClick={() => downloadFile(kubeconfig)} />
      </div>
    </div>
  );
}

export default Kubeconfig;
