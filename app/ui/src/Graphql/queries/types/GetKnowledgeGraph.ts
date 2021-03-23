/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { KnowledgeGraphItemCat } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetKnowledgeGraph
// ====================================================

export interface GetKnowledgeGraph_knowledgeGraph_items_topics {
  __typename: 'Topic';
  name: string;
  relevance: number;
}

export interface GetKnowledgeGraph_knowledgeGraph_items {
  __typename: 'KnowledgeGraphItem';
  id: string;
  category: KnowledgeGraphItemCat;
  title: string;
  abstract: string;
  authors: string[];
  score: number;
  date: string;
  url: string;
  topics: GetKnowledgeGraph_knowledgeGraph_items_topics[];
}

export interface GetKnowledgeGraph_knowledgeGraph_topics {
  __typename: 'Topic';
  name: string;
  relevance: number;
}

export interface GetKnowledgeGraph_knowledgeGraph {
  __typename: 'KnowledgeGraph';
  items: GetKnowledgeGraph_knowledgeGraph_items[];
  topics: GetKnowledgeGraph_knowledgeGraph_topics[];
}

export interface GetKnowledgeGraph {
  knowledgeGraph: GetKnowledgeGraph_knowledgeGraph;
}

export interface GetKnowledgeGraphVariables {
  description: string;
}
