import React, { FC } from 'react';

import { CONFIG } from 'index';
import CopyToClipboard from 'Components/CopyToClipboard/CopyToClipboard';
import IconLink from '@material-ui/icons/Link';
import { RepositoryType } from 'Graphql/types/globalTypes';
import styles from './Summary.module.scss';
import { useReactiveVar } from '@apollo/client';
import { newProject } from 'Graphql/client/cache';

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
  const { information, repository, externalRepository } = useReactiveVar(
    newProject
  );

  const type = repository?.values?.type || RepositoryType.EXTERNAL;
  const isExternalRepo = type === RepositoryType.EXTERNAL;
  const { name, description, id } = information.values;

  function getRepositoryUrl() {
    return isExternalRepo
      ? externalRepository.values.url
      : `${CONFIG.GITEA_URL}/kdl/${id}`;
  }

  return (
    <div className={styles.container}>
      <Section title="Information">
        <Field title="PROJECT NAME">
          <p className={styles.name}>{name}</p>
        </Field>
        <Field title="PROJECT ID">
          <p className={styles.id}>{id}</p>
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
