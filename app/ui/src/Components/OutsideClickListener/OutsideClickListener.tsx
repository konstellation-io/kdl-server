import React, { FC, useEffect, useRef } from 'react';

type Props = {
  children: JSX.Element | JSX.Element[];
  onClickOutside: () => void;
};
const OutsideClickListener: FC<Props> = ({ children, onClickOutside }) => {
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: Event) {
      // @ts-ignore
      if (componentRef.current && !componentRef.current.contains(e.target)) {
        onClickOutside();
      }
    }

    window.addEventListener('blur', onClickOutside);
    document.addEventListener('contextmenu', handleClickOutside);
    document.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('blur', onClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [componentRef, onClickOutside]);

  return <div ref={componentRef}>{children}</div>;
};

export default OutsideClickListener;
