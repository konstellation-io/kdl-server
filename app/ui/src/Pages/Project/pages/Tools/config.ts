import DroneImg from './img/drone.png';
import GiteaImg from './img/gitea.png';
import JupyterImg from './img/jupyter.png';
import MinioImg from './img/minio.png';
import MlFlowImg from './img/mlflow.png';
import { ToolProps } from './components/Tool/Tool';
import VSCodeImg from './img/vscode.png';

enum ToolName {
  GITEA = 'gitea',
  MINIO = 'minio',
  JUPYTER = 'jupyter',
  VSCODE = 'vscode',
  DRONE = 'drone',
  MLFLOW = 'mlflow',
}

export interface Tool extends ToolProps {
  name: ToolName;
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
        name: ToolName.GITEA,
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
        name: ToolName.MINIO,
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
        name: ToolName.JUPYTER,
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
        name: ToolName.VSCODE,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: false,
      },
      {
        img: DroneImg,
        title: 'Drone',
        name: ToolName.DRONE,
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
        name: ToolName.MLFLOW,
        description: 'Nam dapibus nisl vitae elit fringilla.',
        isUserLocalTool: true,
      },
    ],
  },
];
