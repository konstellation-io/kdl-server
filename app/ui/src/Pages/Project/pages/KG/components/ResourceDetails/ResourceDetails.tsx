import {
  SetStarredKGItem,
  SetStarredKGItemVariables,
} from 'Graphql/mutations/types/SetStarredKGItem';

import { Button } from 'kwc';
import {
  GetKnowledgeGraph_knowledgeGraph_items,
  GetKnowledgeGraph_knowledgeGraph_items_topics,
} from 'Graphql/queries/types/GetKnowledgeGraph';
import IconClose from '@material-ui/icons/Close';
import IconStar from '@material-ui/icons/Star';
import IconUnstar from '@material-ui/icons/StarBorder';
import React from 'react';
import { RouteProjectParams } from 'Constants/routes';
import Score from '../KGVisualization/Score/Score';
import URL from 'Components/URL/URL';
import cx from 'classnames';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';
import styles from './ResourceDetails.module.scss';
import { useMutation } from '@apollo/client';
import { useParams } from 'react-router';

const SetStarredKGItemMutation = loader(
  'Graphql/mutations/setStarredKGItem.graphql'
);

type Props = {
  resource: GetKnowledgeGraph_knowledgeGraph_items | null;
  onClose: () => void;
};
function ResourceDetails({ resource, onClose }: Props) {
  const { projectId } = useParams<RouteProjectParams>();

  const [setStarredKGItem] = useMutation<
    SetStarredKGItem,
    SetStarredKGItemVariables
  >(SetStarredKGItemMutation);

  if (resource === null) return null;

  function toggleStarred() {
    if (resource !== null) {
      setStarredKGItem(
        mutationPayloadHelper({
          projectId,
          kgItemId: resource.id,
          starred: !resource.starred,
        })
      );
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <div className={styles.titleText}>Resource Details</div>
        <div className={styles.actions}>
          <div className={styles.starredText}>
            {resource.starred ? 'Starred' : ''}
          </div>
          <Button
            Icon={resource.starred ? IconStar : IconUnstar}
            label=""
            className={cx({ [styles.starred]: resource.starred })}
            onClick={toggleStarred}
          />
          <Button Icon={IconClose} label="" onClick={onClose} />
        </div>
      </div>
      {
        <>
          <div
            className={cx(styles.resourceTitleAndTopics, {
              [styles.starred]: resource.starred,
            })}
          >
            <div className={styles.nameAndTopics}>
              <div className={styles.name}>{resource.title}</div>
            </div>
            <div className={styles.score}>
              <Score value={resource.score} />
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.authors}>
              <div className={styles.sectionTitle}>AUTHORS</div>
              <div className={styles.authorsText}>
                {resource.authors.join(', ')}
              </div>
            </div>
            <div className={styles.type}>{resource.category}</div>
            <URL className={styles.repoUrl}>{resource.url}</URL>
            <div className={styles.topicsG}>
              {resource.topics.length > 0 && (
                <div className={styles.sectionTitle}>TOPICS</div>
              )}
              {resource.topics.map(
                ({
                  name,
                  relevance,
                }: GetKnowledgeGraph_knowledgeGraph_items_topics) => (
                  <div className={styles.topicScore} key={name}>
                    <Score value={relevance} inline />
                    <span>{name}</span>
                  </div>
                )
              )}
            </div>
            {resource.frameworks && (
              <div className={styles.frameworks}>
                <div className={styles.sectionTitle}>FRAMEWORKS</div>
                <div>{resource.frameworks?.join(', ')}</div>
              </div>
            )}
            {resource.repoUrls && (
              <div className={styles.repoUrls}>
                <div className={styles.sectionTitle}>CODE REPOSITORIES</div>
                <div className={styles.repoUrlText}>
                  {resource.repoUrls.map((repoUrl) => (
                    <URL className={styles.repoUrlText} key={repoUrl}>
                      {repoUrl}
                    </URL>
                  ))}
                </div>
              </div>
            )}
            <div className={styles.abstract}>{resource.abstract}</div>
          </div>
        </>
      }
    </div>
  );
}

export default ResourceDetails;
