// Report Writer Types and Interfaces

export interface ReportType {
  id: string;
  name: string;
  sections: string[];
  template: string;
}

export interface CitationStyle {
  id: string;
  name: string;
  package: string;
  style: string;
}

export interface ReportVersion {
  id: string;
  name: string;
  timestamp: number;
  content: string;
  description: string;
}

export interface DataConnection {
  id: string;
  name: string;
  type: 'google_sheets' | 'excel' | 'csv' | 'bigquery' | 'salesforce' | 'database';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: number;
  config: any;
}

export interface DataInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'summary' | 'correlation';
  significance: 'high' | 'medium' | 'low';
  data: any;
  timestamp: number;
}

export interface ChartConfig {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'scatter' | 'area';
  title: string;
  data: any[];
  options: any;
  interactive: boolean;
}

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
  cursor?: {
    line: number;
    column: number;
  };
}

export interface Comment {
  id: string;
  userId: string;
  line: number;
  content: string;
  timestamp: number;
  resolved: boolean;
  replies?: Comment[];
}

export interface ReportWriterState {
  // Document state
  latexContent: string;
  documentTitle: string;
  selectedReportType: string;
  selectedCitationStyle: string;
  
  // Version control
  versions: ReportVersion[];
  
  // Data connections
  dataConnections: DataConnection[];
  insights: DataInsight[];
  charts: ChartConfig[];
  
  // Collaboration
  collaborators: CollaborationUser[];
  comments: Comment[];
  
  // UI state
  leftPaneWidth: number;
  isResizing: boolean;
  showScaffoldModal: boolean;
  showVersions: boolean;
  showCitationManager: boolean;
  showDataPanel: boolean;
  showCollaborationPanel: boolean;
}

export interface ReportWriterAppProps {
  onBackToMain: () => void;
} 