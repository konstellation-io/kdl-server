export enum ProjectSelection {
  ACTIVE = 'ACTIVE',
  INACCESSIBLE = 'INACCESSIBLE',
  ARCHIVED = 'ARCHIVED',
  ALL = 'ALL',
}

export enum ProjectOrder {
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
