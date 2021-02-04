import React, { useRef } from 'react';

import styles from './DefaultPage.module.scss';

export let bottomRef: React.MutableRefObject<HTMLDivElement | null>;
export let topRef: React.MutableRefObject<HTMLDivElement | null>;

type Props = {
  title: string;
  subtitle?: string;
};
function Sidebar({ title, subtitle }: Props) {
  bottomRef = useRef<HTMLDivElement>(null);
  topRef = useRef<HTMLDivElement>(null);

  return (
    <div className={styles.sidebar}>
      <h1>{title}</h1>
      {subtitle && <h3 className={styles.subtitle}>{subtitle}</h3>}
      <div className={styles.top} ref={topRef} />
      <div className={styles.bottom} ref={bottomRef} />
    </div>
  );
}

export default Sidebar;
