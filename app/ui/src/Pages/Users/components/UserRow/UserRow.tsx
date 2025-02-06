import { Left, Right } from 'kwc';

import { AccessLevel } from 'Graphql/types/globalTypes';
import styles from './UserRow.module.scss';
import { mapAccessLevel } from 'Utils/accessLevel';

type Props = {
  email?: string;
  accessLevel?: AccessLevel;
};

function UserRow({ email, accessLevel }: Props) {
  const mappedAccessLevel = mapAccessLevel[accessLevel as AccessLevel] ?? "Unknown";
  return (
    <div className={styles.container}>
      <Left>
        <>{email}</>
      </Left>
      <Right className={styles.right}>
        <>{mappedAccessLevel}</>
      </Right>
    </div>
  );
}

export default UserRow;
