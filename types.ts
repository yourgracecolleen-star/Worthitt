
export interface GroundingSource {
  title: string;
  uri: string;
  type: 'web' | 'map';
}

export interface AnalysisResult {
  text: string;
  sources: GroundingSource[];
  isThinking?: boolean;
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
  evidenceA: string;
  evidenceB: string;
  reason: string;
}

export interface TimelineEvent {
  year: string;
  event: string;
  actor: string;
  type: 'ownership' | 'birth' | 'death' | 'legal';
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
