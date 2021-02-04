import { RepositoryType } from 'Graphql/types/globalTypes';

export interface InformationValues {
  name: string;
  description: string;
}

export interface InformationErrors {
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
  isConnectionTested: boolean;
  hasConnectionError: string;
  warning: boolean;
}

export interface ExternalRepositoryErrors {
  url: string;
  warning: string;
}

export interface InternalRepositoryValues {
  url: string;
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
  internalRepository: NewProject_InternalRepository;
}
