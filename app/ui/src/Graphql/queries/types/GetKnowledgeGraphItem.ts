/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { KnowledgeGraphItemCat } from './../../types/globalTypes';

// ====================================================
// GraphQL query operation: GetKnowledgeGraphItem
// ====================================================

export interface GetKnowledgeGraphItem_knowledgeGraphItem_topics {
  __typename: 'Topic';
  name: string;
  relevance: number;
}

export interface GetKnowledgeGraphItem_knowledgeGraphItem {
  __typename: 'KnowledgeGraphItem';
  id: string;
  category: KnowledgeGraphItemCat;
  title: string;
  abstract: string;
  authors: string[];
  score: number;
  date: string;
  url: string;
  topics: GetKnowledgeGraphItem_knowledgeGraphItem_topics[];
}

export interface GetKnowledgeGraphItem {
  knowledgeGraphItem: GetKnowledgeGraphItem_knowledgeGraphItem;
}

export interface GetKnowledgeGraphItemVariables {
  id: string;
}
