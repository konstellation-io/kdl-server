import { ModalContainer, ModalLayoutInfo, ModalLayoutJustify } from 'kwc';
import React, { FC, useCallback, useEffect } from 'react';

import useBoolState from 'Hooks/useBoolState';
import { useForm } from 'react-hook-form';

type Props = {
  title: string;
  action: (msg: string) => void;
  actionLabel?: string;
  subtitle?: string;
  warning?: boolean;
  error?: boolean;
  message?: string;
  showInput?: boolean;
  confirmationWord?: string;
  children: JSX.Element;
};

type FormData = {
  message: string;
};

const ConfirmAction: FC<Props> = ({
  title,
  subtitle,
  action,
  children,
  message,
  confirmationWord,
  actionLabel,
  showInput = false,
  warning = false,
  error = false,
}) => {
  const {
    handleSubmit,
    setValue,
    register,
    unregister,
    errors,
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      message: '',
    },
  });

  const {
    value: modalVisible,
    activate: showModal,
    deactivate: hideModal,
  } = useBoolState(false);

  const validateMessage = useCallback(
    (value: string) =>
      (confirmationWord &&
        confirmationWord !== value &&
        `You need to type: "${confirmationWord}"`) ||
      true,
    [confirmationWord]
  );

  useEffect(() => {
    register('message', {
      required: showInput && 'This field is mandatory',
      validate: validateMessage,
    });

    return () => unregister('message');
  }, [register, unregister, setValue, validateMessage, showInput]);

  function onSubmit({ message: msg }: FormData) {
    hideModal();
    action(msg);
  }

  return (
    <>
      <div
        onClick={(e) => {
          e.stopPropagation();
          showModal();
        }}
      >
        {children}
      </div>
      {modalVisible && (
        <ModalContainer
          title={title}
          subtitle={subtitle}
          onAccept={handleSubmit(onSubmit)}
          actionButtonLabel={actionLabel}
          onCancel={hideModal}
          warning={warning}
          error={error}
          blocking
        >
          {message && <ModalLayoutInfo>{message}</ModalLayoutInfo>}
          {showInput && (
            <ModalLayoutJustify
              onUpdate={(value: string) => {
                setValue('message', value);
                clearErrors();
              }}
              submit={handleSubmit(onSubmit)}
              error={errors?.message?.message || ''}
              label={
                confirmationWord
                  ? `WRITE "${confirmationWord}"`
                  : 'Why are you doing that?'
              }
              isInput={!!confirmationWord}
            />
          )}
        </ModalContainer>
      )}
    </>
  );
};

export default ConfirmAction;
