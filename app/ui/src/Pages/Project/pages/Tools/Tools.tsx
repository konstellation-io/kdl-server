import { useEffect } from 'react';
import { GetUserTools_project_toolUrls } from 'Graphql/queries/types/GetUserTools';
import useTools from 'Graphql/client/hooks/useTools';

type Props = {
  toolName: keyof GetUserTools_project_toolUrls;
};

function Tools({ toolName }: Props) {
  const { addTool } = useTools();
  useEffect(() => addTool(toolName), [toolName, addTool]);

  return null;
}

export default Tools;
