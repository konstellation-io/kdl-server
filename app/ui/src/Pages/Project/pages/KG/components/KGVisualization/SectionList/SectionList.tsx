import React, { useEffect, useRef } from 'react';

import AnimateHeight from 'react-animate-height';
import IconClose from '@material-ui/icons/Close';
import IconOpen from '@material-ui/icons/SubdirectoryArrowRight';
import cx from 'classnames';
import { stringToId } from 'Utils/d3';
import styles from './SectionList.module.scss';
import useBoolState from 'Hooks/useBoolState';
import { useClickOutside } from 'kwc';

type Props = {
  section: string;
  names: string[];
  setHoveredPaper: (name: string | null) => void;
  onResourceSelection: (name: string) => void;
};
function SectionList({
  section,
  names,
  setHoveredPaper,
  onResourceSelection,
}: Props) {
  const { value: opened, toggle, deactivate: close } = useBoolState(false);

  const componentRef = useRef<HTMLDivElement>(null);
  const { addClickOutsideEvents, removeClickOutsideEvents } = useClickOutside({
    componentRef,
    action: close,
  });

  function onResourceHover(name: string) {
    setHoveredPaper(name);
  }
  function onListLeave() {
    setHoveredPaper(null);
  }

  useEffect(() => {
    if (opened) addClickOutsideEvents();
    else removeClickOutsideEvents();
  }, [opened, addClickOutsideEvents, removeClickOutsideEvents]);

  const Icon = opened ? IconClose : IconOpen;

  return (
    <div
      id={`kg_${stringToId(section)}`}
      className={cx(styles.container, { [styles.opened]: opened })}
    >
      <div
        className={cx(styles.section, { [styles.opened]: opened })}
        ref={componentRef}
        onClick={toggle}
      >
        <span>{`${section} (${names.length})`}</span>
      </div>
    </div>
  );
}

export default SectionList;
