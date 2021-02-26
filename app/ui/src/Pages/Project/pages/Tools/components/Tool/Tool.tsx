import React, { useState } from 'react';
import styles from './Tool.module.scss';
import { SpinnerCircular } from 'kwc';
import cx from 'classnames';
import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';

type Props = {
  isHidden: boolean;
  name: keyof GetUserTools_project_toolUrls;
  src: string;
};

function Tool({ name, isHidden, src }: Props) {
  const [loaded, setLoaded] = useState(false);

  function handleFinishLoad() {
    setLoaded(true);
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.hidden]: isHidden,
      })}
    >
      {!loaded && (
        <div className={styles.shield}>
          <SpinnerCircular />
        </div>
      )}
      <iframe
        title={name}
        src={src}
        frameBorder="0"
        className={styles.iframeContainer}
        onLoad={handleFinishLoad}
      />
    </div>
  );
}

export default Tool;
