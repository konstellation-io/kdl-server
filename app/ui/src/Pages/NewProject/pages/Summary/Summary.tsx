import {
  GET_NEW_PROJECT,
  GetNewProject,
} from 'Graphql/client/queries/getNewProject.graphql';
import React, { FC } from 'react';

import { CONFIG } from 'index';
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
    <h3 className={styles.title}>{title}</h3>
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

  function getRepositoryUrl() {
    let { url } = repoTypeDetails.values;
    return isExternalRepo ? url : `${CONFIG.INTERNAL_REPO_BASE_URL}/${url}`;
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
              <p className={styles.url}>{getRepositoryUrl()}</p>
              <CopyToClipboard>{getRepositoryUrl()}</CopyToClipboard>
            </div>
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
