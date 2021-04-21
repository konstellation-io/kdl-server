import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import React, { useCallback, useEffect, useMemo } from 'react';
import { openedProject, resourceDetails } from 'Graphql/client/cache';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { useQuery, useReactiveVar } from '@apollo/client';

import { PANEL_ID } from 'Graphql/client/models/Panel';
import styles from './KGResults.module.scss';
import useResourceDetails from 'Graphql/client/hooks/useResourceDetails';
import ResourcesList from '../../pages/KG/components/ResourceLists/components/ResourcesList/ResourcesList';
import { KGItem as KGItemType } from '../../pages/KG/KG';

import GetKnowledgeGraphQuery from 'Graphql/queries/getKnowledgeGraph';

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
    (resource: KGItemType) => {
      updateResourceDetails(resource);
      openPanel();
    },
    [updateResourceDetails, openPanel]
  );

  useEffect(() => {
    if (resourceDetailsData !== null && data) {
      const updatedResource = data.knowledgeGraph.items.find(
        (d) => d.id === resourceDetailsData.id
      );
      updatedResource && updateResourceDetails(updatedResource);
    }
  }, [data, resourceDetailsData, updateResourceDetails]);

  const resources = useMemo(() => {
    if (!data) return [];
    return data.knowledgeGraph.items.filter((item) => item.starred);
  }, [data]);

  if (loading || !data)
    return (
      <div className={styles.container}>
        <SpinnerCircular />
      </div>
    );
  if (error) return <ErrorMessage />;

  return (
    <div className={styles.container}>
      <ResourcesList
        onClick={openDetails}
        resources={resources}
        noItems={{
          title: 'No starred items yet!',
          subTitle:
            "Once you favourite an item you'll see them here. Go to the KG to choose your favorites.",
        }}
      />
    </div>
  );
}

export default KGResults;
