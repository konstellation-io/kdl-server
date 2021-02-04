import React, { useEffect, useState } from "react";

import AnimateHeight from "react-animate-height";
import { Button } from "kwc";
import IconOpen from "@material-ui/icons/KeyboardArrowDown";
import IconRetry from "@material-ui/icons/Refresh";
import { MAIL_SUPPORT } from "Constants/konstellationLinks";
import cx from "classnames";
import styles from "./ErrorBox.module.scss";

const MAIL_SUBJECT = "LocalServerRequirements";

function getHeight(opened: boolean) {
  return opened ? "auto" : 40;
}

type Action = {
  label: string;
  onClick: () => void;
};

type Props = {
  title: string;
  message: string;
  docUrl: string;
  openController?: boolean;
  onChange?: Function;
  action: Action;
};
function ErrorBox({
  title,
  message,
  docUrl,
  openController = false,
  onChange,
  action,
}: Props) {
  const [opened, setOpened] = useState(openController);
  const [height, setHeight] = useState<string | number>(
    getHeight(openController)
  );

  useEffect(() => {
    setOpened(openController);
  }, [openController]);

  useEffect(() => {
    setHeight(getHeight(opened));
  }, [opened]);

  function onHandleChange() {
    if (onChange) {
      onChange();
    } else {
      setOpened(!opened);
    }
  }

  return (
    <div
      className={cx(styles.container, {
        [styles.opened]: opened,
      })}
    >
      <AnimateHeight duration={300} height={height} className={styles.box}>
        <div className={styles.titleRow} onClick={onHandleChange}>
          <p className={styles.title}>{title}</p>
          <div className={styles.openButton} onClick={onHandleChange}>
            <IconOpen className="icon-regular" />
          </div>
        </div>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <Button Icon={IconRetry} {...action} />
          <Button label="HOW TO SOLVE" onClick={() => alert("que hacer")} />
        </div>
      </AnimateHeight>
      <div className={styles.submessage}>
        <span>Not resolved?</span>
        <span className={styles.contact} onClick={() => alert("que hacer")}>
          contact us.
        </span>
      </div>
    </div>
  );
}

export default ErrorBox;
