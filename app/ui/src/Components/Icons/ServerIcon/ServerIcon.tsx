import { SvgIcon, SvgIconProps } from "@material-ui/core";
import React from "react";
import styles from "./ServerIcon.module.scss";
import cx from "classnames";

export enum LocalServerStates {
  STARTED = "STARTED",
  STOPPED = "STOPPED",
  STARTING = "STARTING",
  STOPPING = "STOPPING",
}

export enum RemoteServerStates {
  SIGNED_IN = "SIGNED_IN",
  SIGNED_OUT = "SIGNED_OUT",
}

interface AdditionalProps {
  state: LocalServerStates | RemoteServerStates;
}
const ServerIcon = (props: SvgIconProps & AdditionalProps) => (
  <SvgIcon {...props} className={cx(props.className, styles[props.state])}>
    <g>
      <polygon points="3,20 12,2 21,20" />
    </g>
  </SvgIcon>
);
export default ServerIcon;
