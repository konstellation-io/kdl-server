import { ApolloCache, FetchResult, useMutation } from '@apollo/client';
import { CreateProject, CreateProjectVariables } from 'Graphql/mutations/types/CreateProject';
import { GetProjects, GetProjects_projects } from 'Graphql/queries/types/GetProjects';
import { UpdateProject, UpdateProjectVariables } from '../mutations/types/UpdateProject';
import { DeleteProject, DeleteProjectVariables } from '../mutations/types/DeleteProject';

import { CreateProjectInput, DeleteProjectInput } from '../types/globalTypes';
import { mutationPayloadHelper } from 'Utils/formUtils';

import GetProjectsQuery from 'Graphql/queries/getProjects';
import CreateProjectMutation from 'Graphql/mutations/createProject';
import UpdateProjectMutation from 'Graphql/mutations/updateProject';
import DeleteProjectMutation from 'Graphql/mutations/deleteProject';

type UseProjectParams = {
  onUpdateCompleted?: () => void;
  onDeleteCompleted?: () => void;
};
export default function useProject(options?: UseProjectParams) {
  const [mutationCreateProject, { data, error }] = useMutation<CreateProject, CreateProjectVariables>(
    CreateProjectMutation,
    {
      onError: (e) => console.error(`createProject: ${e}`),
      update: updateCacheAdd,
    },
  );

  const [mutationUpdateProject, { loading }] = useMutation<UpdateProject, UpdateProjectVariables>(
    UpdateProjectMutation,
    {
      onError: (e) => console.error(`updateProject: ${e}`),
      onCompleted: options?.onUpdateCompleted,
    },
  );

  const [mutationDeleteProject, { loading: deleteLoading }] = useMutation<DeleteProject, DeleteProjectVariables>(
    DeleteProjectMutation,
    {
      onError: (e) => console.error(`deleteProject: ${e}`),
      onCompleted: options?.onDeleteCompleted,
    },
  );

  function updateCache(cache: ApolloCache<CreateProject>, write: (projects: GetProjects_projects[]) => void) {
    const cacheResult = cache.readQuery<GetProjects>({
      query: GetProjectsQuery,
    });

    if (cacheResult !== null) {
      write(cacheResult.projects);
    }
  }

  function updateCacheAdd(cache: ApolloCache<CreateProject>, { data: dataCreate }: FetchResult<CreateProject>) {
    if (dataCreate && dataCreate.createProject) {
      updateCache(cache, (projects) =>
        cache.writeQuery({
          query: GetProjectsQuery,
          data: {
            projects: [...projects, dataCreate.createProject],
          },
        }),
      );
    }
  }

  function addNewProject(newProject: CreateProjectInput) {
    mutationCreateProject(mutationPayloadHelper(newProject));
  }

  function updateProjectName(id: string, name: string) {
    mutationUpdateProject(mutationPayloadHelper({ id, name }));
  }

  function updateProjectDescription(id: string, description: string) {
    mutationUpdateProject(mutationPayloadHelper({ id, description }));
  }

  function updateProjectArchived(id: string, archived: boolean) {
    mutationUpdateProject(mutationPayloadHelper({ id, archived }));
  }

  function deleteProject(id: string) {
    mutationDeleteProject(mutationPayloadHelper({ id }));
  }

  return {
    addNewProject,
    updateProjectName,
    updateProjectDescription,
    archiveProjectAction: {
      updateProjectArchived,
      loading,
    },
    deleteProjectAction: {
      deleteProject,
      loading: deleteLoading,
    },
    create: { data, error },
  };
}
