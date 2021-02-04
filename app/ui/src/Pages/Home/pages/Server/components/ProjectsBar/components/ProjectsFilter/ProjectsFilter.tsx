import { ErrorMessage, Select, SelectTheme, SpinnerCircular } from 'kwc';
import {
  GET_PROJECT_FILTERS,
  GetProjectFilters,
} from 'Graphql/client/queries/getProjectsFilters.graphql';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import { ProjectSelection } from 'Pages/Home/apollo/models/ProjectFilters';
import React from 'react';
import capitalize from 'lodash.capitalize';
import { loader } from 'graphql.macro';
import styles from './ProjectsFilter.module.scss';
import useProjectFilters from 'Pages/Home/apollo/hooks/useProjectFilters';
import { useQuery } from '@apollo/client';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

function ProjectsFilter() {
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { data: localData } = useQuery<GetProjectFilters>(GET_PROJECT_FILTERS);
  const { updateFilters, getProjectCounts } = useProjectFilters();

  const filters = localData?.projectFilters;

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  const options = Object.values(ProjectSelection);
  const optionCounts = getProjectCounts(data.projects);
  const optionsMapper = Object.fromEntries(
    options.map((option) => [
      option,
      `${capitalize(option)} (${optionCounts.get(option) || 0})`,
    ])
  );

  return (
    <div className={styles.container}>
      <Select
        onChange={(selection: ProjectSelection) => updateFilters({ selection })}
        label=""
        hideError
        options={options}
        height={67}
        defaultOption={ProjectSelection.ACTIVE}
        theme={SelectTheme.DARK}
        formSelectedOption={filters?.selection}
        className={styles.formSelect}
        valuesMapper={optionsMapper}
      />
    </div>
  );
}

export default ProjectsFilter;
