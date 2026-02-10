
export type SourceCategory = 'census' | 'tax' | 'newspaper' | 'map' | 'legal' | 'web';

export interface GroundingSource {
  title: string;
  uri: string;
  type: SourceCategory;
}

export interface AnalysisResult {
  text: string;
  sources: GroundingSource[];
  isThinking?: boolean;
  verificationScore?: number; // 0-100
  securityHash?: string;
}

export enum ActiveModule {
  SEARCH = 'search',
  ANALYZE = 'analyze',
  MAPS = 'maps',
  SCAN = 'scan',
  CONFLICTS = 'conflicts',
  VISUALIZE = 'visualize',
  AUDIT = 'audit'
}

export interface Conflict {
  id: string;
  recordType: 'ancestry' | 'land';
  description: string;
  summary: string;
  evidenceA: string;
  evidenceB: string;
  reason: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
  actor: string;
  type: 'ownership' | 'birth' | 'death' | 'legal' | 'tax' | 'census';
}

export interface VisualizationData {
  timeline: TimelineEvent[];
  familyTree: {
    name: string;
    role: string;
    propertyLink: string;
    children?: any[];
  }[];
}
