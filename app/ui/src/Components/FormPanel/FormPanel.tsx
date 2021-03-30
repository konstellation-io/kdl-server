import { Button } from 'kwc';
import React from 'react';
import ActionsBar from 'Components/Layout/ActionsBar/ActionsBar';

type Props = {
  children: JSX.Element | JSX.Element[];
  onSave: () => void;
  onClose: () => void;
  actionsClass?: string;
};
const FormPanel = ({ children, onSave, onClose, actionsClass }: Props) => (
  <>
    {children}
    <ActionsBar className={actionsClass}>
      <Button label="SAVE" onClick={onSave} primary />
      <Button label="CANCEL" onClick={onClose} />
    </ActionsBar>
  </>
);

export default FormPanel;
