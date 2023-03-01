import { RepositoryAuthMethod, RepositoryType } from 'Graphql/types/globalTypes';

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
  type: RepositoryType | null;
}

export interface RepositoryErrors {
  type: string;
}

export interface ExternalRepositoryValues {
  url: string;
  username: string;
  credential: string;
  authMethod: RepositoryAuthMethod;
}

export interface ExternalRepositoryErrors {
  url: string;
  username: string;
  credential: string;
  authMethod: string;
}

export interface InternalRepositoryValues {
  slug: string;
}

export interface InternalRepositoryErrors {
  slug: string;
}

export interface NewProject_ExternalRepository {
  values: ExternalRepositoryValues;
  errors: ExternalRepositoryErrors;
}

export interface NewProject_InternalRepository {
  values: InternalRepositoryValues;
  errors: InternalRepositoryErrors;
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
  externalRepository: NewProject_ExternalRepository;
}
