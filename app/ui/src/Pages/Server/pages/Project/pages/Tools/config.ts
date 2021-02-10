import { ToolProps } from './components/Tool/Tool';
import GiteaImg from './img/gitea.png';
import MinioImg from './img/minio.png';
import JupyterImg from './img/jupyter.png';
import VSCodeImg from './img/vscode.png';
import DroneImg from './img/drone.png';
import MlFlowImg from './img/mlflow.png';
import { ToolName } from 'Graphql/types/globalTypes';

export interface Tool extends ToolProps {
  toolName: ToolName;
  isUserLocalTool: boolean;
}

export interface EnhancedTool extends Tool {
  url: string;
}

interface ToolGroup {
  title: string;
  row: number;
  tools: Tool[];
}

export interface EnhancedToolGroups extends ToolGroup {
  tools: EnhancedTool[];
}

export const toolsGroups: ToolGroup[] = [
  {
    title: 'Code repository',
    row: 0,
    tools: [
      {
        img: GiteaImg,
        title: 'Gitea',
        toolName: ToolName.GITEA,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: true,
      },
    ],
  },
  {
    title: 'Storage',
    row: 0,
    tools: [
      {
        img: MinioImg,
        title: 'Minio',
        toolName: ToolName.MINIO,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: true,
      },
    ],
  },
  {
    title: 'Analysis',
    row: 0,
    tools: [
      {
        img: JupyterImg,
        title: 'Jupyter',
        toolName: ToolName.JUPYTER,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: false,
      },
    ],
  },
  {
    title: 'Experiments',
    row: 1,
    tools: [
      {
        img: VSCodeImg,
        title: 'VSCode',
        toolName: ToolName.VSCODE,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: false,
      },
      {
        img: DroneImg,
        title: 'Drone',
        toolName: ToolName.DRONE,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: true,
      },
    ],
  },
  {
    title: 'Results',
    row: 1,
    tools: [
      {
        img: MlFlowImg,
        title: 'MlFlow',
        toolName: ToolName.MLFLOW,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: true,
      },
    ],
  },
];
