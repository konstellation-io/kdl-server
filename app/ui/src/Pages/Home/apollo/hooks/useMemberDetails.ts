import { MemberDetails } from '../models/MemberDetails';
import { memberDetails } from './../cache';

function useMemberDetails() {
  function updateMemberDetails(details: MemberDetails) {
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
