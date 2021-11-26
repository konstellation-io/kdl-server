import { memberDetails } from '../cache';
import { GetProjectMembers_project_members } from '../../queries/types/GetProjectMembers';

function useMemberDetails() {
  function updateMemberDetails(details: GetProjectMembers_project_members) {
    memberDetails(details);
  }

  function unselectMemberDetails() {
    memberDetails(null);
  }

  return {
    updateMemberDetails,
    unselectMemberDetails,
  };
}

export default useMemberDetails;
