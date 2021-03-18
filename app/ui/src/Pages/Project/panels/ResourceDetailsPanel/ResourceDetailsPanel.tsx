import { ErrorMessage, SpinnerCircular } from 'kwc';
import {
  GetKnowledgeGraphItem,
  GetKnowledgeGraphItemVariables,
} from 'Graphql/queries/types/GetKnowledgeGraphItem';

import { D } from 'Pages/Project/pages/KG/components/KGVisualization/KGVisualization';
import React from 'react';
import ResourceDetails from 'Pages/Project/pages/KG/components/ResourceDetails/ResourceDetails';
import { loader } from 'graphql.macro';
import styles from './MemberDetails.module.scss';
import { useQuery } from '@apollo/client';

const GetKGItemQuery = loader('Graphql/queries/getKnowledgeGraphItem.graphql');

type Props = {
  resource: D;
  close: () => void;
};
function MemberDetail({ resource, close }: Props) {
  const { data, loading, error } = useQuery<
    GetKnowledgeGraphItem,
    GetKnowledgeGraphItemVariables
  >(GetKGItemQuery, {
    variables: {
      id: resource.id,
    },
  });

  if (loading || !data) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  return (
    <ResourceDetails
      resource={resource}
      onClose={close}
      idToFullResource={{
        [resource.id]: data.knowledgeGraphItem,
      }}
    />
  );
}

export default MemberDetail;
