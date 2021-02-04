import { ErrorMessage, Select, SelectTheme, SpinnerCircular } from 'kwc';
import {
  GET_PROJECT_FILTERS,
  GetProjectFilters,
} from 'Graphql/client/queries/getProjectsFilters.graphql';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import { ProjectOrder } from 'Pages/Home/apollo/models/ProjectFilters';
import React from 'react';
import { loader } from 'graphql.macro';
import styles from './ProjectsOrder.module.scss';
import useProjectFilters from 'Pages/Home/apollo/hooks/useProjectFilters';
import { useQuery } from '@apollo/client';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

function ProjectsOrder() {
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { data: localData } = useQuery<GetProjectFilters>(GET_PROJECT_FILTERS);
  const { updateFilters } = useProjectFilters();

  const filters = localData?.projectFilters;

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  const options = Object.values(ProjectOrder);
  const optionsMapper = {
    [ProjectOrder.VISITED]: 'Recently visited',
    [ProjectOrder.CREATION]: 'Creation date',
    [ProjectOrder.AZ]: 'From A to Z',
    [ProjectOrder.ZA]: 'From Z to A',
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>SORT BY</p>
      <Select
        onChange={(order: ProjectOrder) => updateFilters({ order })}
        label=""
        hideError
        options={options}
        theme={SelectTheme.DARK}
        defaultOption={ProjectOrder.VISITED}
        formSelectedOption={filters?.order}
        valuesMapper={optionsMapper}
      />
    </div>
  );
}

export default ProjectsOrder;
