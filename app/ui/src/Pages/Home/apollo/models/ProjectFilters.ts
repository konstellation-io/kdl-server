export enum ProjectSelection {
  ACTIVE = 'ACTIVE',
  STARRED = 'STARRED',
  ARCHIVED = 'ARCHIVED',
  ALL = 'ALL',
}

export enum ProjectOrder {
  VISITED = 'VISITED',
  CREATION = 'CREATION',
  AZ = 'AZ',
  ZA = 'ZA',
}

export interface ProjectFilters {
  name: string;
  selection: ProjectSelection;
  order: ProjectOrder;
  nFiltered: number;
}
