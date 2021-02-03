import React, { FC, MouseEvent } from 'react';

import { Button } from 'kwc';
import IconCopy from '@material-ui/icons/FileCopyOutlined';
import { copyAndToast } from 'Utils/clipboard';
import cx from 'classnames';
import styles from './CopyToClipboard.module.scss';

type Props = {
  children: string;
  className?: string;
};
const CopyToClipboard: FC<Props> = ({ children, className }) => {
  function onCopy(event?: MouseEvent<HTMLDivElement>) {
    event?.stopPropagation();
    event?.preventDefault();

    copyAndToast(children);
  }

  return (
    <Button
      label=""
      Icon={IconCopy}
      onClick={onCopy}
      className={cx(styles.container, className)}
    />
  );
};

export default CopyToClipboard;
