import React, { FC } from 'react';
import styles from './RuntimeSelector.module.scss';
import { NavLink } from 'react-router-dom';
import ROUTE, { buildRoute } from 'Constants/routes';
import { BottomComponentProps } from '../Breadcrumbs/components/Crumb/Crumb';
import { GetRuntimes_runtimes } from 'Graphql/queries/types/GetRuntimes';
import RuntimeItem from './RuntimeItem/RuntimeItem';
import { run } from 'apollo';

type Props = {
  runtimes: GetRuntimes_runtimes[];
};
const RuntimeSelector: FC<Props & BottomComponentProps> = ({ runtimes }) => (
  <div className={styles.container}>
    <ul>
      {runtimes.map((runtime: GetRuntimes_runtimes) => (
        <li className={styles.projectName} key={runtime.id}>
          <RuntimeItem runtime={runtime}></RuntimeItem>
        </li>
      ))}
    </ul>
  </div>
);
export default RuntimeSelector;
