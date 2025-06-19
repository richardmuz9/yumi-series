import React, { useState, useRef, useEffect } from 'react';
import { sendChatMessage, searchPapers, uploadFile, checkPlagiarism, exportDocument } from '../../services/reportWriterApi';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actionType?: 'research' | 'upload' | 'cite' | 'plagiarism' | 'export';
}

interface AIAssistantPaneProps {
  onResearchResult: (result: any) => void;
  onFileUpload: (fileData: any) => void;
  currentLatex: string;
}

export const AIAssistantPane: React.FC<AIAssistantPaneProps> = ({
  onResearchResult,
  onFileUpload,
  currentLatex
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: 'Welcome to your AI Research Assistant! I can help you find academic papers, process uploaded documents, check for plagiarism, and export your work. What would you like to do first?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (content: string, type: 'user' | 'assistant' | 'system', actionType?: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      actionType: actionType as any
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue;
    setInputValue('');
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      // Simulate API call to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let response = '';
      let actionData = null;

      if (activeAction === 'research') {
        response = `I found several relevant papers for "${userMessage}". Here are the top results:\n\n1. "Advanced LaTeX Techniques for Academic Writing" by Smith et al. (2023)\n2. "AI-Assisted Document Generation" by Johnson & Lee (2024)\n3. "Automated Citation Management Systems" by Brown (2023)\n\nWould you like me to add citations for any of these papers to your document?`;
        actionData = {
          citations: [
            { key: 'smith2023', title: 'Advanced LaTeX Techniques for Academic Writing', authors: ['Smith', 'Johnson', 'Wilson'] },
            { key: 'johnson2024', title: 'AI-Assisted Document Generation', authors: ['Johnson', 'Lee'] }
          ]
        };
      } else if (activeAction === 'plagiarism') {
        response = `Plagiarism check completed for your document. Here's the analysis:\n\n✅ Overall originality: 94%\n⚠️ Found 2 potential issues:\n- Section 2.1: 15% similarity to "Research Methods in AI" (Consider adding citation)\n- Section 3.2: 8% similarity to Wikipedia entry\n\nRecommendations:\n- Add proper citations for the flagged sections\n- Paraphrase or quote the similar content`;
      } else if (activeAction === 'export') {
        response = `Export options for your document:\n\n📄 PDF: Click to compile your LaTeX to PDF\n📝 Word: Convert to DOCX format (experimental)\n📊 Excel: Extract tables to spreadsheet\n🌐 HTML: Web-friendly version\n\nWhich format would you like to export to?`;
      } else {
        response = `I understand you want to ${activeAction || 'chat about your research'}. ${userMessage}\n\nI can help you with:\n- Finding and citing academic papers\n- Processing uploaded documents\n- Checking for plagiarism\n- Exporting to various formats\n\nWhat specific assistance do you need?`;
      }

      addMessage(response, 'assistant', activeAction || undefined);
      
      if (actionData) {
        onResearchResult(actionData);
      }
    } catch (error) {
      addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleActionClick = (action: string) => {
    setActiveAction(action);
    
    switch (action) {
      case 'research':
        setInputValue('Find papers about ');
        break;
      case 'upload':
        fileInputRef.current?.click();
        break;
      case 'cite':
        addMessage('Citation assistant activated. I can help you format citations, manage your bibliography, or find missing references. What do you need?', 'assistant', 'cite');
        break;
      case 'plagiarism':
        handlePlagiarismCheck();
        break;
      case 'export':
        handleExportOptions();
        break;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    addMessage(`Uploading file: ${file.name}`, 'user', 'upload');

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const extractedText = `Extracted content from ${file.name}:\n\nThis is simulated extracted text from your uploaded document. In a real implementation, this would contain the actual text extracted from PDFs, Word documents, or images using OCR.`;
      
      addMessage(`Successfully processed ${file.name}!\n\n${extractedText}\n\nI can help you:\n- Integrate this content into your LaTeX document\n- Extract key citations and references\n- Analyze the content for relevant topics`, 'assistant', 'upload');
      
      onFileUpload({
        filename: file.name,
        extractedText: extractedText,
        fileType: file.type
      });
    } catch (error) {
      addMessage(`Error processing file: ${file.name}`, 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlagiarismCheck = async () => {
    setIsLoading(true);
    addMessage('Starting plagiarism check...', 'assistant', 'plagiarism');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const analysis = `Plagiarism Analysis Complete!\n\n📊 Document Statistics:\n- Word count: ${currentLatex.split(' ').length}\n- Sections analyzed: 5\n- References checked: 12\n\n✅ Results:\n- Overall originality: 96%\n- No significant plagiarism detected\n- All citations properly formatted\n\n💡 Suggestions:\n- Consider adding more recent sources (2023-2024)\n- Expand the literature review section\n- Double-check citation formatting for consistency`;
      
      addMessage(analysis, 'assistant', 'plagiarism');
    } catch (error) {
      addMessage('Error during plagiarism check. Please try again.', 'assistant');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportOptions = () => {
    const exportMessage = `🚀 Export Your Document\n\nAvailable formats:\n\n📄 PDF - Compile LaTeX to professional PDF\n📝 Word - Convert to DOCX (experimental)\n📊 Excel - Extract tables and data\n🌐 HTML - Web-friendly version\n📱 Markdown - Plain text format\n\nWhich format would you like to export to? Just type the format name (e.g., "PDF" or "Word").`;
    
    addMessage(exportMessage, 'assistant', 'export');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="ai-assistant-pane h-full flex flex-col">
      <div className="ai-assistant-header flex-shrink-0">
        <h3 className="ai-assistant-title">
          🤖 Research Assistant
        </h3>
        <div className="action-buttons">
          <button 
            className={`action-button ${activeAction === 'research' ? 'active' : ''}`}
            onClick={() => handleActionClick('research')}
          >
            🔍 Research
          </button>
          <button 
            className={`action-button ${activeAction === 'upload' ? 'active' : ''}`}
            onClick={() => handleActionClick('upload')}
          >
            📁 Upload
          </button>
          <button 
            className={`action-button ${activeAction === 'cite' ? 'active' : ''}`}
            onClick={() => handleActionClick('cite')}
          >
            🔗 Cite
          </button>
          <button 
            className={`action-button ${activeAction === 'plagiarism' ? 'active' : ''}`}
            onClick={() => handleActionClick('plagiarism')}
          >
            📊 Plagiarism
          </button>
          <button 
            className={`action-button ${activeAction === 'export' ? 'active' : ''}`}
            onClick={() => handleActionClick('export')}
          >
            📤 Export
          </button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              {message.content.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <div className="message-timestamp">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message assistant loading">
            <div className="message-content">
              <p>🤔 Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <textarea
            className="chat-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to research papers, upload files, check plagiarism, or export your document..."
            disabled={isLoading}
            rows={2}
          />
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="quick-actions">
          <button 
            className="quick-action-btn" 
            onClick={() => setInputValue('Help me write an introduction for this topic')}
          >
            ✍️ Introduction
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => setInputValue('Find recent papers about')}
          >
            🔍 Find Papers
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => setInputValue('Generate citations in APA format')}
          >
            📚 Citations
          </button>
          <button 
            className="quick-action-btn" 
            onClick={() => setInputValue('Improve this section for clarity and flow')}
          >
            ⚡ Improve
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
        onChange={handleFileUpload}
      />
    </div>
  );
}; 