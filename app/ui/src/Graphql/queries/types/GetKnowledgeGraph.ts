/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { KnowledgeGraphItemCat } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetKnowledgeGraph
// ====================================================

export interface GetKnowledgeGraph_knowledgeGraph_items {
  __typename: 'KnowledgeGraphItem';
  category: KnowledgeGraphItemCat;
  score: number;
  title: string;
}

export interface GetKnowledgeGraph_knowledgeGraph {
  __typename: 'KnowledgeGraph';
  items: GetKnowledgeGraph_knowledgeGraph_items[];
}

export interface GetKnowledgeGraph {
  knowledgeGraph: GetKnowledgeGraph_knowledgeGraph;
}

export interface GetKnowledgeGraphVariables {
  description: string;
}
