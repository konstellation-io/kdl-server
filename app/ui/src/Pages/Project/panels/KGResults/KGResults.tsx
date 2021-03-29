import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetKnowledgeGraph,
  GetKnowledgeGraphVariables,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import { PANEL_SIZE, PANEL_THEME } from 'Components/Layout/Panel/Panel';
import React, { useCallback, useMemo, useState } from 'react';
import usePanel, { PanelType } from 'Graphql/client/hooks/usePanel';
import { useQuery, useReactiveVar } from '@apollo/client';

import { D } from 'Pages/Project/pages/KG/components/KGVisualization/KGVisualization';
import { PANEL_ID } from 'Graphql/client/models/Panel';
import { loader } from 'graphql.macro';
import { openedProject } from 'Graphql/client/cache';
import { starredItems } from 'Pages/Project/pages/KG/KG';
import styles from './KGResults.module.scss';
import useResourceDetails from 'Graphql/client/hooks/useResourceDetails';
import ResourcesList from '../../pages/KG/components/ResourceLists/components/ResourcesList/ResourcesList';

const GetKnowledgeGraphQuery = loader(
  'Graphql/queries/getKnowledgeGraph.graphql'
);

function KGResults() {
  const [listFilterText, setListFilterText] = useState('');
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
    title: '',
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

  const resources = useMemo(() => {
    if (!data) return [];
    return data.knowledgeGraph.items
      .map((d, idx: number) => ({
        id: d.id,
        category: 'Others',
        type: d.category,
        name: d.title,
        score: d.score,
        starred: starredItems.includes(idx),
      }))
      .filter(
        (item) =>
          item.starred &&
          item.name.toLowerCase().includes(listFilterText.toLowerCase())
      );
  }, [listFilterText, data?.knowledgeGraph.items]);

  if (loading || !data)
    return (
      <div className={styles.container}>
        <SpinnerCircular />
      </div>
    );
  if (error) return <ErrorMessage />;

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
      <ResourcesList
        onClick={openDetails}
        onChangeFilterText={(filter) => setListFilterText(filter)}
        filterText={listFilterText}
        resources={resources}
        noItems={{
          title: 'No starred items yet!',
          subTitle:
            "Once you favourite an item you'll see them here. Go to the KG to choose your favorites.",
        }}
        idToFullResource={idToFullResource}
      />
    </div>
  );
}

export default KGResults;
