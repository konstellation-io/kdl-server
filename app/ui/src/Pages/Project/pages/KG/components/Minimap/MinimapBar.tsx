import { Button } from 'kwc';
import IconExpand from '@material-ui/icons/ZoomOutMap';
import IconMap from '@material-ui/icons/Map';
import IconShrink from '@material-ui/icons/FullscreenExit';
import React from 'react';
import cx from 'classnames';
import styles from './Minimap.module.scss';

type Props = {
  minimapVisible: boolean;
  toggleMinimap: () => void;
  expanded: boolean;
  toggleExpanded: () => void;
  zoomValue: number;
  zoomIn: () => void;
  zoomOut: () => void;
};
function MinimapBar({ minimapVisible, toggleMinimap, expanded, toggleExpanded, zoomValue, zoomIn, zoomOut }: Props) {
  return (
    <div className={ styles.bar }>
      <div className={ styles.actions }>
        <Button
          label=""
          Icon={IconMap}
          onClick={toggleMinimap}
          className={cx({[styles.active]: minimapVisible})}
        />
        <Button
          label=""
          Icon={expanded ? IconShrink : IconExpand}
          onClick={toggleExpanded}
          className={cx({[styles.active]: expanded})}
          disabled={!minimapVisible}
        />
      </div>
      <div className={ styles.zoom }>
        <div className={ styles.textButton }><Button label="+" onClick={zoomIn} /></div>
        <div className={ styles.textButton }><Button label="-" onClick={zoomOut} /></div>
        <div className={ styles.zoomValue}>
          {`${Math.round(zoomValue * 100)}%`}
        </div>
      </div>
    </div>
  )
}

export default MinimapBar;
