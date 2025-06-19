import { ReportType, CitationStyle } from '../types/ReportTypes';

export const REPORT_TYPES: ReportType[] = [
  {
    id: 'research_paper',
    name: 'Research Paper',
    sections: ['Abstract', 'Introduction', 'Literature Review', 'Methodology', 'Results', 'Discussion', 'Conclusion'],
    template: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{hyperref}

\\title{Research Paper Title}
\\author{Author Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
% Write your abstract here - a brief summary of your research
\\end{abstract}

\\section{Introduction}
% Introduce your research topic and objectives

\\section{Literature Review}
% Review existing research and identify gaps

\\section{Methodology}
% Describe your research methods and approach

\\section{Results}
% Present your findings with data and analysis

\\section{Discussion}
% Interpret your results and their implications

\\section{Conclusion}
% Summarize key findings and future work

\\bibliographystyle{plain}
\\bibliography{references}

\\end{document}`
  },
  {
    id: 'white_paper',
    name: 'White Paper',
    sections: ['Executive Summary', 'Problem Statement', 'Solution Overview', 'Case Study', 'Implementation', 'Call to Action'],
    template: `\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\usepackage{booktabs}
\\usepackage{xcolor}
\\geometry{margin=1in}

\\title{White Paper: Solution Title}
\\author{Company Name}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Executive Summary}
% Brief overview of the problem and your solution

\\section{Problem Statement}
% Define the challenge or issue being addressed

\\section{Solution Overview}
% Present your solution and its benefits

\\section{Case Study}
% Provide real-world examples or use cases

\\section{Implementation}
% Detail how to implement the solution

\\section{Call to Action}
% Next steps and contact information

\\end{document}`
  },
  {
    id: 'business_report',
    name: 'Business Report',
    sections: ['Executive Summary', 'Market Analysis', 'Financial Overview', 'Recommendations', 'Appendices'],
    template: `\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{xcolor}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\usepackage{geometry}
\\geometry{margin=1in}

\\title{Business Report: Market Analysis}
\\author{Business Intelligence Team}
\\date{\\today}

\\begin{document}

\\maketitle

\\section{Executive Summary}
% High-level overview of key findings and recommendations

\\section{Market Analysis}
% Detailed market trends and competitive landscape

\\section{Financial Overview}
% Revenue, costs, and profitability analysis

\\section{Data Insights}
% Key metrics and performance indicators

\\section{Recommendations}
% Strategic recommendations based on analysis

\\section{Appendices}
% Supporting data tables and charts

\\end{document}`
  },
  {
    id: 'technical_report',
    name: 'Technical Report',
    sections: ['Abstract', 'System Overview', 'Architecture', 'Implementation', 'Testing', 'Results', 'Conclusions'],
    template: `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{listings}
\\usepackage{xcolor}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\geometry{margin=1in}

\\lstset{
  backgroundcolor=\\color{gray!10},
  basicstyle=\\ttfamily\\small,
  breaklines=true,
  frame=single
}

\\title{Technical Report: System Analysis}
\\author{Engineering Team}
\\date{\\today}

\\begin{document}

\\maketitle

\\begin{abstract}
% Technical summary of the system and findings
\\end{abstract}

\\section{System Overview}
% High-level system description

\\section{Architecture}
% Technical architecture and design patterns

\\section{Implementation}
% Implementation details and code examples

\\section{Testing}
% Testing methodology and results

\\section{Performance Analysis}
% System performance metrics and optimizations

\\section{Conclusions}
% Technical conclusions and future work

\\end{document}`
  }
];

export const CITATION_STYLES: CitationStyle[] = [
  { id: 'apa', name: 'APA Style', package: '\\usepackage[style=apa]{biblatex}', style: 'apa' },
  { id: 'mla', name: 'MLA Style', package: '\\usepackage[style=mla]{biblatex}', style: 'mla' },
  { id: 'ieee', name: 'IEEE Style', package: '\\usepackage[style=ieee]{biblatex}', style: 'ieee' },
  { id: 'chicago', name: 'Chicago Style', package: '\\usepackage[style=chicago-authordate]{biblatex}', style: 'chicago-authordate' },
  { id: 'harvard', name: 'Harvard Style', package: '\\usepackage[style=authoryear]{biblatex}', style: 'authoryear' },
  { id: 'vancouver', name: 'Vancouver Style', package: '\\usepackage[style=vancouver]{biblatex}', style: 'vancouver' },
  { id: 'nature', name: 'Nature Style', package: '\\usepackage[style=nature]{biblatex}', style: 'nature' }
];

export const DATA_CONNECTION_TYPES = [
  {
    id: 'google_sheets',
    name: 'Google Sheets',
    icon: '📊',
    description: 'Connect to Google Sheets for live data',
    setupFields: ['sheetId', 'range', 'apiKey']
  },
  {
    id: 'excel',
    name: 'Excel File',
    icon: '📈',
    description: 'Upload and analyze Excel files',
    setupFields: ['file', 'worksheet', 'range']
  },
  {
    id: 'csv',
    name: 'CSV Upload',
    icon: '📄',
    description: 'Upload CSV files for data analysis',
    setupFields: ['file', 'delimiter', 'hasHeaders']
  },
  {
    id: 'bigquery',
    name: 'BigQuery',
    icon: '🗄️',
    description: 'Connect to Google BigQuery datasets',
    setupFields: ['projectId', 'datasetId', 'query', 'credentials']
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: '☁️',
    description: 'Import Salesforce reports and data',
    setupFields: ['instanceUrl', 'accessToken', 'reportId']
  },
  {
    id: 'database',
    name: 'SQL Database',
    icon: '🛢️',
    description: 'Connect to MySQL, PostgreSQL, or SQL Server',
    setupFields: ['host', 'port', 'database', 'username', 'password', 'query']
  }
];

export const CHART_TYPES = [
  { id: 'line', name: 'Line Chart', icon: '📈', description: 'Show trends over time' },
  { id: 'bar', name: 'Bar Chart', icon: '📊', description: 'Compare values across categories' },
  { id: 'pie', name: 'Pie Chart', icon: '🥧', description: 'Show proportions of a whole' },
  { id: 'scatter', name: 'Scatter Plot', icon: '⚫', description: 'Show correlations between variables' },
  { id: 'area', name: 'Area Chart', icon: '🏔️', description: 'Show cumulative totals over time' },
  { id: 'heatmap', name: 'Heat Map', icon: '🌡️', description: 'Show intensity across categories' },
  { id: 'radar', name: 'Radar Chart', icon: '🎯', description: 'Compare multiple metrics' }
];

export const INSIGHT_TEMPLATES = {
  trend: {
    title: 'Trend Analysis',
    description: 'Detected significant trend in {metric} with {direction} movement of {percentage}% over {timeframe}',
    icon: '📈'
  },
  anomaly: {
    title: 'Anomaly Detection',
    description: 'Unusual pattern detected in {metric} on {date}, deviating {percentage}% from expected range',
    icon: '⚠️'
  },
  summary: {
    title: 'Data Summary',
    description: 'Key insights from {dataset}: {insights}',
    icon: '📋'
  },
  correlation: {
    title: 'Correlation Found',
    description: 'Strong correlation ({coefficient}) identified between {variable1} and {variable2}',
    icon: '🔗'
  }
};

export const DEFAULT_LATEX_TEMPLATE = `\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{amsmath}
\\usepackage{graphicx}
\\usepackage{booktabs}
\\usepackage{longtable}
\\usepackage{hyperref}

\\title{Enhanced Report}
\\author{Generated by Yumi Report Writer}
\\date{\\today}

\\begin{document}
\\maketitle

Welcome to the enhanced Report Writer with data integration capabilities!

\\section{Getting Started}
\\begin{itemize}
\\item Use the Data Panel to connect your data sources
\\item Generate insights automatically from your data
\\item Create interactive charts and visualizations
\\item Collaborate in real-time with your team
\\end{itemize}

\\section{Data Integration}
Connect to various data sources including Google Sheets, Excel files, databases, and more.

\\section{AI-Powered Insights}
Our AI analyzes your data to generate narrative insights and identify trends, anomalies, and correlations.

\\end{document}`; 