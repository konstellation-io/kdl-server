import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import React, { useCallback } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { useQuery, useReactiveVar } from '@apollo/client';

import { D } from 'Pages/Project/pages/KG/components/KGVisualization/KGVisualization';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import ResourceLists from 'Pages/Project/pages/KG/components/ResourceLists/ResourceLists';
import { loader } from 'graphql.macro';
import { openedProject } from 'Graphql/client/cache';
import { starredItems } from 'Pages/Project/pages/KG/KG';
import styles from './KGResults.module.scss';
import useResourceDetails from 'Graphql/client/hooks/useResourceDetails';

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

function KGResults() {
  const { updateResourceDetails } = useResourceDetails();

  const openedProjectData = useReactiveVar(openedProject);
  const { data, loading, error } = useQuery<
    GetKnowledgeGraph,
    GetKnowledgeGraphVariables
  >(GetKnowledgeGraphQuery, {
    variables: { description: openedProjectData?.description || '' },
  });

  const { openPanel } = usePanel(PanelType.SECONDARY, {
    id: PANEL_ID.KG_RESULT_DETAILS,
    title: 'Resource details',
    size: PANEL_SIZE.BIG,
    theme: PANEL_THEME.DARK,
  });

  const openDetails = useCallback(
    (details: D) => {
      updateResourceDetails(details);
      openPanel();
    },
    [updateResourceDetails, openPanel]
  );

  if (loading || !data) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const resources = data.knowledgeGraph.items.map((d, idx: number) => ({
    id: d.id,
    category: 'Others',
    type: d.category,
    name: d.title,
    score: d.score,
    starred: starredItems.includes(idx),
  }));

  const idToFullResource = Object.fromEntries(
    data.knowledgeGraph.items.map((d) => [
      d.id,
      {
        title: d.title,
        abstract: d.abstract,
        topics: d.topics,
        score: d.score,
        date: d.date,
        authors: d.authors,
        url: d.url,
      },
    ])
  );

  return (
    <div className={styles.container}>
      <ResourceLists
        resources={resources}
        starredResources={resources.filter((r) => r.starred)}
        onResourceClick={openDetails}
        scores={[1, 0]}
        idToFullResource={idToFullResource}
      />
    </div>
  );
}

export default KGResults;
