import { RepositoryAuthMethod } from 'Graphql/types/globalTypes';

export interface InformationValues {
  id: string;
  name: string;
  description: string;
}

export interface InformationErrors {
  id: string;
  name: string;
  description: string;
}

export interface RepositoryValues {
  url: string;
  username: string;
  credential: string;
  authMethod: RepositoryAuthMethod;
}

export interface RepositoryErrors {
  type: string;
  url: string;
  username: string;
  credential: string;
  authMethod: RepositoryAuthMethod;
}

export interface NewProject_Repository {
  values: RepositoryValues;
  errors: RepositoryErrors;
}

export interface NewProject_Information {
  values: InformationValues;
  errors: InformationErrors;
}

export interface NewProject_Repository {
  values: RepositoryValues;
  errors: RepositoryErrors;
}

export interface NewProject {
  information: NewProject_Information;
  repository: NewProject_Repository;
}
