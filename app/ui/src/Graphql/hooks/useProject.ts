import { ApolloCache, FetchResult, useMutation } from '@apollo/client';
import {
  CreateProject,
  CreateProjectVariables,
} from 'Graphql/mutations/types/CreateProject';
import {
  GetProjects,
  GetProjects_projects,
} from 'Graphql/queries/types/GetProjects';
import {
  UpdateProject,
  UpdateProjectVariables,
} from '../mutations/types/UpdateProject';

import { RepositoryType } from '../types/globalTypes';
import { loader } from 'graphql.macro';
import { mutationPayloadHelper } from 'Utils/formUtils';

const GetProjectsQuery = loader('Graphql/queries/getProjects.graphql');

const CreateProjectMutation = loader('Graphql/mutations/createProject.graphql');
const UpdateProjectMutation = loader('Graphql/mutations/updateProject.graphql');

type NewProjectParams = {
  repository: {
    type: RepositoryType;
    url: string;
  };
  name: string;
  description: string;
};

export default function useProject() {
  const [mutationCreateProject, { data }] = useMutation<
    CreateProject,
    CreateProjectVariables
  >(CreateProjectMutation, {
    onError: (e) => console.error(`createProject: ${e}`),
    update: updateCacheAdd,
  });

  const [mutationUpdateProject] = useMutation<
    UpdateProject,
    UpdateProjectVariables
  >(UpdateProjectMutation, {
    onError: (e) => console.error(`updateProject: ${e}`),
  });

  function updateCache(
    cache: ApolloCache<CreateProject>,
    write: (projects: GetProjects_projects[]) => void
  ) {
    const cacheResult = cache.readQuery<GetProjects>({
      query: GetProjectsQuery,
    });

    if (cacheResult !== null) {
      write(cacheResult.projects);
    }
  }

  function updateCacheAdd(
    cache: ApolloCache<CreateProject>,
    { data: dataCreate }: FetchResult<CreateProject>
  ) {
    if (dataCreate && dataCreate.createProject) {
      updateCache(cache, (projects) =>
        cache.writeQuery({
          query: GetProjectsQuery,
          data: {
            projects: [...projects, dataCreate.createProject],
          },
        })
      );
    }
  }

  function addNewProject(newProject: NewProjectParams) {
    mutationCreateProject(mutationPayloadHelper(newProject));
  }

  function updateProjectName(id: string, name: string) {
    mutationUpdateProject(mutationPayloadHelper({ id, name }));
  }

  function updateProjectRepositoryUrl(id: string, url: string) {
    mutationUpdateProject(mutationPayloadHelper({ id, repository: { url } }));
  }

  return {
    addNewProject,
    updateProjectName,
    updateProjectRepositoryUrl,
    create: { data },
  };
}
