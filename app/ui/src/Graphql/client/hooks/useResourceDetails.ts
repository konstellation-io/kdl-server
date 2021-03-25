import { GetKnowledgeGraph_knowledgeGraph_items } from 'Graphql/queries/types/GetKnowledgeGraph';
import { resourceDetails } from './../cache';

function useResourceDetails() {
  function updateResourceDetails(d: GetKnowledgeGraph_knowledgeGraph_items) {
    resourceDetails(d);
  }

  function unselectResourceDetails() {
    resourceDetails(null);
  }

  return {
    updateResourceDetails,
    unselectResourceDetails,
  };
}

export default useResourceDetails;
