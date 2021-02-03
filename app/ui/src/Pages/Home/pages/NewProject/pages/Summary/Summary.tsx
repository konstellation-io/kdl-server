import CircledInfoMessage, {
  CircledInfoMessageTypes,
} from 'Components/CircledInfoMessage/CircledInfoMessage';
import {
  GET_NEW_PROJECT,
  GetNewProject,
  GetNewProject_newProject_externalRepository,
} from 'Graphql/client/queries/getNewProject.graphql';
import React, { FC } from 'react';

import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import IconLink from '@material-ui/icons/Link';
import { RepositoryType } from 'Graphql/types/globalTypes';
import { SpinnerCircular } from 'kwc';
import styles from './Summary.module.scss';
import { useQuery } from '@apollo/client';

type FieldProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
  incomplete?: boolean;
};
const Field: FC<FieldProps> = ({ title, children }) => (
  <div className={styles.field}>
    <p className={styles.label}>{title}</p>
    {children}
  </div>
);

type SectionProps = {
  children: JSX.Element | JSX.Element[];
  title: string;
};
const Section: FC<SectionProps> = ({ title, children }) => (
  <div className={styles.section}>
    <p className={styles.title}>{title}</p>
    {children}
  </div>
);

function Summary() {
  const { data } = useQuery<GetNewProject>(GET_NEW_PROJECT);

  if (!data) return <SpinnerCircular />;

  const { information, repository } = data.newProject;
  const type = repository?.values?.type || RepositoryType.EXTERNAL;
  const isExternalRepo = type === RepositoryType.EXTERNAL;
  const { name, description } = information.values;
  const repoTypeDetails = isExternalRepo
    ? data.newProject.externalRepository
    : data.newProject.internalRepository;
  const { url } = repoTypeDetails.values;

  function getRepositoryCheckMessage() {
    const hasConnectionError =
      (repoTypeDetails as GetNewProject_newProject_externalRepository).values
        .hasConnectionError !== '';

    const messageText = hasConnectionError
      ? 'connection error'
      : 'connection ok';
    const messageType = hasConnectionError
      ? CircledInfoMessageTypes.ERROR
      : CircledInfoMessageTypes.SUCCESS;

    return <CircledInfoMessage type={messageType} text={messageText} />;
  }

  return (
    <div className={styles.container}>
      <Section title="Information">
        <Field title="PROJECT NAME">
          <p className={styles.name}>{name}</p>
        </Field>
        <Field title="REPOSITORY URL">
          <div className={styles.repository}>
            <div className={styles.urlContainer}>
              <IconLink className="icon-regular" />
              <p className={styles.url}>{url}</p>
              <CopyToClipboard>{url}</CopyToClipboard>
            </div>
            {isExternalRepo && getRepositoryCheckMessage()}
          </div>
        </Field>
        <Field title="PROJECT DESCRIPTION">
          <div className={styles.descriptionContainer}>{description}</div>
        </Field>
      </Section>
    </div>
  );
}

export default Summary;
