import { ErrorMessage, Select, SelectTheme, SpinnerCircular } from 'kwc';

import { GetProjects } from 'Graphql/queries/types/GetProjects';
import { ProjectOrder } from 'Graphql/client/models/ProjectFilters';
import React from 'react';
import styles from './ProjectsOrder.module.scss';
import useProjectFilters from 'Graphql/client/hooks/useProjectFilters';
import { useQuery, useReactiveVar } from '@apollo/client';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import { projectFilters } from '../../../../Graphql/client/cache';

function ProjectsOrder() {
  const { data, error, loading } = useQuery<GetProjects>(GetProjectsQuery);
  const { order } = useReactiveVar(projectFilters);
  const { updateFilters } = useProjectFilters();

  if (loading) return <SpinnerCircular />;
  if (error || !data) return <ErrorMessage />;

  const options = Object.values(ProjectOrder);
  const optionsMapper = {
    [ProjectOrder.CREATION]: 'Creation date',
    [ProjectOrder.AZ]: 'From A to Z',
    [ProjectOrder.ZA]: 'From Z to A',
  };

  return (
    <div className={styles.container}>
      <p className={styles.label}>SORT BY</p>
      <Select
        onChange={(newOrder: ProjectOrder) =>
          updateFilters({ order: newOrder })
        }
        label=""
        hideError
        options={options}
        theme={SelectTheme.DARK}
        defaultOption={ProjectOrder.CREATION}
        formSelectedOption={order}
        valuesMapper={optionsMapper}
      />
    </div>
  );
}

export default ProjectsOrder;
