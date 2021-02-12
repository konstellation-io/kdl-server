import React, { useEffect, useRef } from 'react';

import AnimateHeight from 'react-animate-height';
import IconClose from '@material-ui/icons/Close';
import cx from 'classnames';
import { stringToId } from 'Utils/d3';
import styles from './SectionList.module.scss';
import useBoolState from 'Hooks/useBoolState';
import { useClickOutside } from 'kwc';

type Props = {
  section: string;
  names: string[];
  setHoveredPaper: (name: string | null) => void;
};
function SectionList({ section, names, setHoveredPaper }: Props) {
  const {
    value: opened,
    activate: open,
    deactivate: close
  } = useBoolState(false);
  
  const componentRef = useRef<HTMLDivElement>(null);
  const {
    addClickOutsideEvents,
    removeClickOutsideEvents
  } = useClickOutside({ componentRef, action: close });

  function onResourceHover(name: string) {
    setHoveredPaper(name);
  }
  function onListLeave() {
    setHoveredPaper(null);
  }

  useEffect(() => {
    if (opened) addClickOutsideEvents();
    else removeClickOutsideEvents();
  }, [opened, addClickOutsideEvents, removeClickOutsideEvents])
  
  return (
    <div
      id={`kg_${stringToId(section)}`}
      className={ styles.container }
    >
      <div className={ cx(styles.section, {[styles.opened]: opened}) } ref={componentRef} onClick={open}>
        <span>{`${section} (${names.length})`}</span>
        <IconClose className="icon-small" />
      </div>
      <AnimateHeight
        height={opened ? 'auto' : 0}
        duration={300}
      >
        <div className={styles.list} onMouseLeave={onListLeave}>
          { names.map((name, idx) =>
            <div
              key={name}
              className={styles.name}
              onMouseMove={() => onResourceHover(name)}
              onClick={() => alert(name)}
            >
              <div className={styles.nameIndex}>{ idx+1 }</div>
              <div className={styles.nameValue}>{ name }</div>
            </div>
          )}
        </div>
      </AnimateHeight>
      {opened && <div>
      </div>}
    </div>
  )
}

export default SectionList;
