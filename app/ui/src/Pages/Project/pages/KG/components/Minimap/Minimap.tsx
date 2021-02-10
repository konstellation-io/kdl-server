import React, { MutableRefObject } from 'react';

import styles from './Minimap.module.scss';

export const MINIMAP_WIDTH = 202;
export const MINIMAP_HEIGHT = 162;

interface Props {
  minimapRef: MutableRefObject<SVGSVGElement | null>;
}

function Minimap({ minimapRef }: Props) {
  return (
    <div className={ styles.container }>
      <svg
        ref={minimapRef}
        width={MINIMAP_WIDTH}
        height={MINIMAP_HEIGHT}
        className={styles.minimap}
      />
      <div className={ styles.bar }/>
    </div>
  )
}

export default Minimap;
