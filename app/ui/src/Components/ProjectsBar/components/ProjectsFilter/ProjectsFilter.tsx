import { ErrorMessage, Select, SelectTheme, SpinnerCircular } from 'kwc';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import { ProjectSelection } from 'Graphql/client/models/ProjectFilters';
import * as React from 'react';
import capitalize from 'lodash.capitalize';
import styles from './ProjectsFilter.module.scss';
import useProjectFilters from 'Graphql/client/hooks/useProjectFilters';
import { useQuery, useReactiveVar } from '@apollo/client';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import { projectFilters } from 'Graphql/client/cache';

function ProjectsFilter() {
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { selection } = useReactiveVar(projectFilters);
  const { updateFilters, getProjectCounts } = useProjectFilters();

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  const options = Object.values(ProjectSelection);
  const optionCounts = getProjectCounts(data.projects);
  const optionsMapper = Object.fromEntries(
    options.map((option) => [option, `${capitalize(option)} (${optionCounts.get(option) || 0})`]),
  );

  return (
    <div className={styles.container} data-testid="filterProjects">
      <Select
        onChange={(newSelection: ProjectSelection) => updateFilters({ selection: newSelection })}
        label=""
        hideError
        options={options}
        height={67}
        defaultOption={ProjectSelection.ACTIVE}
        theme={SelectTheme.DARK}
        formSelectedOption={selection}
        className={styles.formSelect}
        valuesMapper={optionsMapper}
      />
    </div>
  );
}

export default ProjectsFilter;
