import { D } from 'Pages/Project/pages/KG/components/KGVisualization/KGVisualization';
import { resourceDetails } from './../cache';

function useResourceDetails() {
  function updateResourceDetails(d: D) {
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
