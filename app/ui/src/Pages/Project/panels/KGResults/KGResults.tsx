import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import React, { useCallback, useEffect } from 'react';
import { openedProject, resourceDetails } from 'Graphql/client/cache';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { useQuery, useReactiveVar } from '@apollo/client';

import { PANEL_ID } from 'Graphql/client/models/Panel';
import ResourceLists from 'Pages/Project/pages/KG/components/ResourceLists/ResourceLists';
import { loader } from 'graphql.macro';
import styles from './KGResults.module.scss';
import useResourceDetails from 'Graphql/client/hooks/useResourceDetails';

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

function KGResults() {
  const { updateResourceDetails } = useResourceDetails();

  const resourceDetailsData = useReactiveVar(resourceDetails);
  const openedProjectData = useReactiveVar(openedProject);
  const { data, loading, error } = useQuery<
    GetKnowledgeGraph,
    GetKnowledgeGraphVariables
  >(GetKnowledgeGraphQuery, {
    variables: { projectId: openedProjectData?.id || '' },
  });

  const { openPanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.KG_RESULT_DETAILS,
    title: '',
    size: PANEL_SIZE.BIG,
    theme: PANEL_THEME.DARK,
  });

  const openDetails = useCallback(
    (id: string, name: string, left: number) => {
      const resource = data?.knowledgeGraph.items.find((r) => r.id === id);
      if (resource) {
        updateResourceDetails(resource);
        openPanel();
      }
    },
    [updateResourceDetails, openPanel, data]
  );

  useEffect(() => {
    if (resourceDetailsData !== null && data) {
      const updatedResource = data.knowledgeGraph.items.find(
        (d) => d.id === resourceDetailsData.id
      );
      updatedResource && updateResourceDetails(updatedResource);
    }
  }, [data, resourceDetailsData, updateResourceDetails]);

  if (loading || !data)
    return (
      <div className={styles.container}>
        <SpinnerCircular />
      </div>
    );
  if (error) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <ResourceLists
        resources={data.knowledgeGraph.items}
        starredResources={data.knowledgeGraph.items.filter((r) => r.starred)}
        onResourceClick={openDetails}
        scores={[1, 0]}
      />
    </div>
  );
}

export default KGResults;
