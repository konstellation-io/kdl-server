import { Button, ErrorMessage, HorizontalBar, SpinnerCircular } from 'kwc';
import Card, { CardState } from 'Components/Layout/Card/Card';
import React, { useEffect } from 'react';

import IconOk from '@material-ui/icons/Check';
import IconStart from '@material-ui/icons/PlayArrow';
import IconStop from '@material-ui/icons/Stop';
import IconWarn from '@material-ui/icons/Warning';
import ToolGroup from './ToolGroup';
import cx from 'classnames';
import styles from './Tools.module.scss';
import useExternalBrowserWindows, {
  channelName,
} from './useExternalBrowserWindows';
import { useParams } from 'react-router-dom';
import { RouteProjectParams } from 'Constants/routes';
import { useQuery } from '@apollo/client';
import { loader } from 'graphql.macro';
import {
  GetProjectTools,
  GetProjectToolsVariables,
} from 'Graphql/queries/types/GetProjectTools';
import { EnhancedTool, EnhancedToolGroups } from './config';
import Tool from './components/Tool/Tool';
import { mapTools } from './mappingFunctions';
import useTool from 'Graphql/hooks/useTool';

const GetProjectToolsQuery = loader('Graphql/queries/getProjectTools.graphql');

function Tools() {
  const { projectId } = useParams<RouteProjectParams>();
  const { data, loading, error } = useQuery<
    GetProjectTools,
    GetProjectToolsVariables
  >(GetProjectToolsQuery, {
    variables: { id: projectId },
  });
  const { openWindow } = useExternalBrowserWindows();
  const {
    updateProjectActiveTools,
    projectActiveTools: { loading: toggleActiveProjectToolsLoading },
  } = useTool(projectId);

  useEffect(() => {
    // ipcMain.on(channelName, onMessage);
    // return () => {
    //   ipcMain.removeListener(channelName, onMessage);
    // };
  }, []);

  // const onMessage = (event: IpcMainEvent, args: any) => {
  //   console.log(`Message received on the main window: ${args}`);
  // };

  if (!data || loading) return <SpinnerCircular />;
  if (error) return <ErrorMessage />;

  const {
    project: { tools: projectTools, areToolsActive },
  } = data;

  function toggleActive() {
    updateProjectActiveTools(!areToolsActive);
  }

  function handleToolClick({ url, toolName, img }: EnhancedTool) {
    openWindow(url, `${projectId}-${toolName}`, img);
  }

  function renderCard(tool: EnhancedTool) {
    return (
      <Card
        key={tool.title}
        state={
          tool.isUserLocalTool || areToolsActive
            ? CardState.OK
            : CardState.ALERT
        }
      >
        <Tool
          {...tool}
          onClick={() => handleToolClick(tool)}
          disabled={!tool.isUserLocalTool && !areToolsActive}
        />
      </Card>
    );
  }

  function renderGroup({ title, tools: toolsCards }: EnhancedToolGroups) {
    return (
      <ToolGroup title={title} key={title}>
        <div className={styles.multiCard}>{toolsCards.map(renderCard)}</div>
      </ToolGroup>
    );
  }

  const tools = mapTools(projectTools);
  const firstRow = tools.filter(({ row }) => row === 0);
  const secondRow = tools.filter(({ row }) => row === 1);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.row}>{firstRow.map(renderGroup)}</div>
        <div className={styles.row}>{secondRow.map(renderGroup)}</div>
      </div>
      <HorizontalBar className={styles.actions}>
        <div className={styles.actionsContent}>
          <div className={styles.left}>
            <div
              className={cx(styles.toolsStatus, {
                [styles.active]: areToolsActive,
              })}
            >
              {(() => {
                const Icon = areToolsActive ? IconOk : IconWarn;
                return <Icon className="icon-regular" />;
              })()}
              <span>
                {`YOUR PRIVATE TOOLS ARE ${
                  areToolsActive ? 'RUNNING' : 'STOPPED'
                }`}
              </span>
            </div>
          </div>
          <div className={styles.right}>
            <span className={styles.actionMessage}>{`TO ${
              areToolsActive ? 'STOP' : 'START'
            } YOUR PRIVATE TOOLS, JUST`}</span>
            <Button
              className={styles.toggleActiveButton}
              loading={toggleActiveProjectToolsLoading}
              label={areToolsActive ? 'STOP' : 'START'}
              onClick={toggleActive}
              Icon={areToolsActive ? IconStop : IconStart}
              height={30}
              primary
            />
          </div>
        </div>
      </HorizontalBar>
    </div>
  );
}

export default Tools;
