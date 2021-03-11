import React from 'react';
import { D } from '../../../KGVisualization/KGVisualization';
import KGItem from '../KGItem/KGItem';

type Props = {
  onClick: (resource: D) => void;
  onEnter: (name: string) => void;
  onLeave: () => void;
  starredResources: D[];
};
function TabStarred({ starredResources, onClick, onEnter, onLeave }: Props) {
  return (
    <div>
      {starredResources.map((r) => (
        <KGItem
          resource={r}
          onClick={onClick}
          onLeave={onLeave}
          onEnter={onEnter}
          isStarred
        />
      ))}
    </div>
  );
}

export default TabStarred;
