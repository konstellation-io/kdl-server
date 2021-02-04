import { FC } from 'react';
import { createPortal } from 'react-dom';
import { topRef } from './Sidebar';

type Props = {
  children: JSX.Element;
};
const SidebarTop: FC<Props> = ({ children }) =>
  topRef?.current && createPortal(children, topRef.current);

export default SidebarTop;
