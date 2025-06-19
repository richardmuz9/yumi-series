import React, { useState, useEffect } from 'react';
import { DataConnection, DataInsight, ChartConfig } from '../types/ReportTypes';
import { DATA_CONNECTION_TYPES, CHART_TYPES, INSIGHT_TEMPLATES } from '../constants/ReportConstants';

interface DataConnectorProps {
  connections: DataConnection[];
  insights: DataInsight[];
  charts: ChartConfig[];
  onConnectionAdd: (connection: DataConnection) => void;
  onConnectionRemove: (connectionId: string) => void;
  onInsightGenerate: (insights: DataInsight[]) => void;
  onChartCreate: (chart: ChartConfig) => void;
  onInsertData: (latexCode: string) => void;
}

interface DataUpload {
  file: File | null;
  headers: string[];
  preview: any[][];
  processing: boolean;
}

const DataConnector: React.FC<DataConnectorProps> = ({
  connections,
  insights,
  charts,
  onConnectionAdd,
  onConnectionRemove,
  onInsightGenerate,
  onChartCreate,
  onInsertData
}) => {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedConnectionType, setSelectedConnectionType] = useState('');
  const [connectionConfig, setConnectionConfig] = useState<any>({});
  const [dataUpload, setDataUpload] = useState<DataUpload>({
    file: null,
    headers: [],
    preview: [],
    processing: false
  });
  const [activeTab, setActiveTab] = useState<'connections' | 'insights' | 'charts'>('connections');
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  const handleFileUpload = async (file: File) => {
    setDataUpload(prev => ({ ...prev, file, processing: true }));

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/report-writer/upload-data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      
      setDataUpload(prev => ({
        ...prev,
        headers: result.headers,
        preview: result.preview,
        processing: false
      }));

      // Auto-create connection
      const newConnection: DataConnection = {
        id: `upload_${Date.now()}`,
        name: file.name,
        type: file.name.endsWith('.csv') ? 'csv' : 'excel',
        status: 'connected',
        lastSync: Date.now(),
        config: {
          fileName: file.name,
          fileSize: file.size,
          headers: result.headers,
          rowCount: result.rowCount
        }
      };

      onConnectionAdd(newConnection);
      setShowConnectionModal(false);

    } catch (error) {
      console.error('File upload error:', error);
      setDataUpload(prev => ({ ...prev, processing: false }));
      alert('Failed to upload file. Please try again.');
    }
  };

  const handleConnectionSetup = async () => {
    try {
      const connectionType = DATA_CONNECTION_TYPES.find(t => t.id === selectedConnectionType);
      if (!connectionType) return;

      // Validate required fields
      const missingFields = connectionType.setupFields.filter(field => !connectionConfig[field]);
      if (missingFields.length > 0) {
        alert(`Please fill in required fields: ${missingFields.join(', ')}`);
        return;
      }

      const response = await fetch('/api/report-writer/connect-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: selectedConnectionType,
          config: connectionConfig
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create connection');
      }

      const result = await response.json();
      
      const newConnection: DataConnection = {
        id: result.connectionId,
        name: connectionConfig.name || `${connectionType.name} Connection`,
        type: selectedConnectionType as any,
        status: 'connected',
        lastSync: Date.now(),
        config: connectionConfig
      };

      onConnectionAdd(newConnection);
      setShowConnectionModal(false);
      setSelectedConnectionType('');
      setConnectionConfig({});

    } catch (error) {
      console.error('Connection setup error:', error);
      alert('Failed to create connection. Please check your configuration.');
    }
  };

  const generateInsights = async (connectionId?: string) => {
    setIsGeneratingInsights(true);

    try {
      const response = await fetch('/api/report-writer/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          connectionId,
          connections: connectionId ? [connections.find(c => c.id === connectionId)] : connections
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const result = await response.json();
      onInsightGenerate(result.insights);

    } catch (error) {
      console.error('Insight generation error:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const createChart = async (connectionId: string, chartType: string) => {
    try {
      const response = await fetch('/api/report-writer/create-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          connectionId,
          chartType,
          title: `${chartType} Chart from ${connections.find(c => c.id === connectionId)?.name}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chart');
      }

      const result = await response.json();
      onChartCreate(result.chart);

    } catch (error) {
      console.error('Chart creation error:', error);
      alert('Failed to create chart. Please try again.');
    }
  };

  const insertInsightToLatex = (insight: DataInsight) => {
    const latexCode = `
\\section{${insight.title}}
${insight.description}

\\begin{itemize}
\\item Significance: ${insight.significance.charAt(0).toUpperCase() + insight.significance.slice(1)}
\\item Generated: ${new Date(insight.timestamp).toLocaleDateString()}
\\end{itemize}
`;
    onInsertData(latexCode);
  };

  const insertChartToLatex = (chart: ChartConfig) => {
    const latexCode = `
\\begin{figure}[h]
\\centering
% Insert ${chart.type} chart: ${chart.title}
% Chart data would be processed and converted to TikZ/PGFPlots
\\includegraphics[width=0.8\\textwidth]{charts/${chart.id}.png}
\\caption{${chart.title}}
\\label{fig:${chart.id}}
\\end{figure}
`;
    onInsertData(latexCode);
  };

  return (
    <div className="data-connector">
      <div className="data-connector-header">
        <h3>📊 Data Integration</h3>
        <div className="data-tabs">
          <button 
            className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
            onClick={() => setActiveTab('connections')}
          >
            Connections ({connections.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
          >
            Insights ({insights.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            Charts ({charts.length})
          </button>
        </div>
      </div>

      {/* Connections Tab */}
      {activeTab === 'connections' && (
        <div className="connections-panel">
          <div className="panel-actions">
            <button 
              className="add-connection-btn"
              onClick={() => setShowConnectionModal(true)}
            >
              + Add Data Source
            </button>
            <button 
              className="generate-insights-btn"
              onClick={() => generateInsights()}
              disabled={connections.length === 0 || isGeneratingInsights}
            >
              {isGeneratingInsights ? 'Generating...' : '✨ Generate Insights'}
            </button>
          </div>

          <div className="connections-list">
            {connections.map(connection => (
              <div key={connection.id} className="connection-item">
                <div className="connection-info">
                  <div className="connection-header">
                    <span className="connection-icon">
                      {DATA_CONNECTION_TYPES.find(t => t.id === connection.type)?.icon || '📄'}
                    </span>
                    <span className="connection-name">{connection.name}</span>
                    <span className={`connection-status ${connection.status}`}>
                      {connection.status}
                    </span>
                  </div>
                  <div className="connection-details">
                    <small>Last sync: {new Date(connection.lastSync).toLocaleString()}</small>
                  </div>
                </div>
                
                <div className="connection-actions">
                  <button onClick={() => generateInsights(connection.id)}>
                    📈 Analyze
                  </button>
                  <button onClick={() => onConnectionRemove(connection.id)}>
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}

            {connections.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h4>No Data Sources Connected</h4>
                <p>Connect your first data source to start generating insights</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="insights-panel">
          <div className="insights-list">
            {insights.map(insight => (
              <div key={insight.id} className="insight-item">
                <div className="insight-header">
                  <span className="insight-icon">
                    {INSIGHT_TEMPLATES[insight.type]?.icon || '💡'}
                  </span>
                  <span className="insight-title">{insight.title}</span>
                  <span className={`insight-significance ${insight.significance}`}>
                    {insight.significance}
                  </span>
                </div>
                
                <div className="insight-content">
                  <p>{insight.description}</p>
                </div>
                
                <div className="insight-actions">
                  <button onClick={() => insertInsightToLatex(insight)}>
                    📝 Insert to Report
                  </button>
                  <small>{new Date(insight.timestamp).toLocaleString()}</small>
                </div>
              </div>
            ))}

            {insights.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">💡</div>
                <h4>No Insights Generated</h4>
                <p>Connect data sources and generate insights to see them here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="charts-panel">
          <div className="charts-list">
            {charts.map(chart => (
              <div key={chart.id} className="chart-item">
                <div className="chart-header">
                  <span className="chart-icon">
                    {CHART_TYPES.find(t => t.id === chart.type)?.icon || '📊'}
                  </span>
                  <span className="chart-title">{chart.title}</span>
                  <span className="chart-type">{chart.type}</span>
                </div>
                
                <div className="chart-preview">
                  {/* Chart preview would go here */}
                  <div className="chart-placeholder">
                    {CHART_TYPES.find(t => t.id === chart.type)?.icon} Preview
                  </div>
                </div>
                
                <div className="chart-actions">
                  <button onClick={() => insertChartToLatex(chart)}>
                    📝 Insert to Report
                  </button>
                  {chart.interactive && (
                    <button>🎛️ Configure</button>
                  )}
                </div>
              </div>
            ))}

            {charts.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📈</div>
                <h4>No Charts Created</h4>
                <p>Generate insights to automatically create charts</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Setup Modal */}
      {showConnectionModal && (
        <div className="modal-overlay">
          <div className="connection-modal">
            <div className="modal-header">
              <h3>Add Data Source</h3>
              <button 
                className="close-btn"
                onClick={() => setShowConnectionModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              {!selectedConnectionType ? (
                <div className="connection-types">
                  {DATA_CONNECTION_TYPES.map(type => (
                    <div 
                      key={type.id}
                      className="connection-type-card"
                      onClick={() => setSelectedConnectionType(type.id)}
                    >
                      <div className="type-icon">{type.icon}</div>
                      <div className="type-info">
                        <h4>{type.name}</h4>
                        <p>{type.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="connection-setup">
                  <h4>Configure {DATA_CONNECTION_TYPES.find(t => t.id === selectedConnectionType)?.name}</h4>
                  
                  {selectedConnectionType === 'csv' || selectedConnectionType === 'excel' ? (
                    <div className="file-upload-area">
                      <input
                        type="file"
                        accept={selectedConnectionType === 'csv' ? '.csv' : '.xlsx,.xls'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file);
                        }}
                        disabled={dataUpload.processing}
                      />
                      
                      {dataUpload.processing && (
                        <div className="upload-progress">Analyzing file...</div>
                      )}
                      
                      {dataUpload.preview.length > 0 && (
                        <div className="data-preview">
                          <h5>Data Preview:</h5>
                          <table>
                            <thead>
                              <tr>
                                {dataUpload.headers.map(header => (
                                  <th key={header}>{header}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dataUpload.preview.slice(0, 3).map((row, i) => (
                                <tr key={i}>
                                  {row.map((cell, j) => (
                                    <td key={j}>{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="config-fields">
                      {DATA_CONNECTION_TYPES.find(t => t.id === selectedConnectionType)?.setupFields.map(field => (
                        <div key={field} className="field-group">
                          <label>{field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                          <input
                            type={field.includes('password') ? 'password' : 'text'}
                            value={connectionConfig[field] || ''}
                            onChange={(e) => setConnectionConfig(prev => ({
                              ...prev,
                              [field]: e.target.value
                            }))}
                            placeholder={`Enter ${field}`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button onClick={() => setSelectedConnectionType('')}>
                      Back
                    </button>
                    <button 
                      onClick={handleConnectionSetup}
                      disabled={selectedConnectionType === 'csv' || selectedConnectionType === 'excel' ? !dataUpload.file : false}
                    >
                      Connect
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataConnector; 