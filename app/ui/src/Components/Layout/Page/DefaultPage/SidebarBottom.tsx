import { FC } from 'react';
import { bottomRef } from './Sidebar';
import { createPortal } from 'react-dom';

type Props = {
  children: JSX.Element;
};
const SidebarBottom: FC<Props> = ({ children }) =>
  bottomRef?.current && createPortal(children, bottomRef.current);

export default SidebarBottom;
