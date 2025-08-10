// src/components/Session/ExecutionPanel.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const ExecutionPanel = ({
  sessionId,
  language,
  executionState,
  localResult,
  loading,
  error,
  onExecute,
  canExecute = true,
  className
}) => {
  const { theme, fontSize } = useTheme();
  const [activeTab, setActiveTab] = useState('output');
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const outputRef = useRef(null);
  const inputRef = useRef(null);

  // Combine execution results (real-time from socket + local API calls)
  const currentResult = executionState?.result || localResult;
  const currentError = executionState?.error || error;
  const isExecuting = executionState?.isRunning || loading;
  const executedBy = executionState?.executedBy;

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [currentResult, currentError, history]);

  // Add execution to history
  useEffect(() => {
    if (currentResult && !isExecuting) {
      setHistory(prev => [
        {
          id: Date.now(),
          timestamp: new Date(),
          language,
          input: input || '',
          result: currentResult,
          error: currentError,
          executedBy: executedBy || 'You',
        },
        ...prev.slice(0, 19) // Keep last 20 executions
      ]);
    }
  }, [currentResult, currentError, isExecuting, language, input, executedBy]);

  // Handle code execution
  const handleExecute = useCallback(() => {
    if (!canExecute || isExecuting) return;
    
    // Clear previous results
    setActiveTab('output');
    
    // Execute with input if provided
    onExecute?.(undefined, input);
  }, [canExecute, isExecuting, onExecute, input]);

  // Handle input submission
  const handleInputSubmit = useCallback((e) => {
    e.preventDefault();
    handleExecute();
  }, [handleExecute]);

  // Clear output
  const handleClearOutput = useCallback(() => {
    setIsClearing(true);
    setTimeout(() => {
      setHistory([]);
      setIsClearing(false);
    }, 300);
  }, []);

  // Copy output to clipboard
  const handleCopyOutput = useCallback(() => {
    if (currentResult) {
      const outputText = typeof currentResult === 'object' 
        ? currentResult.output || JSON.stringify(currentResult, null, 2)
        : currentResult;
      
      navigator.clipboard.writeText(outputText).then(() => {
        // You could show a toast here
      });
    }
  }, [currentResult]);

  // Format execution time
  const formatExecutionTime = useCallback((time) => {
    if (time < 1000) return `${time}ms`;
    if (time < 60000) return `${(time / 1000).toFixed(2)}s`;
    return `${(time / 60000).toFixed(2)}m`;
  }, []);

  // Format memory usage
  const formatMemoryUsage = useCallback((bytes) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  }, []);

  // Get language icon
  const getLanguageIcon = useCallback((lang) => {
    const icons = {
      javascript: '🟨',
      python: '🐍',
      cpp: '⚡',
      c: '🔷',
      java: '☕',
      go: '🐹',
      rust: '🦀',
    };
    return icons[lang] || '📄';
  }, []);

  // Parse execution result
  const parseResult = useCallback((result) => {
    if (!result) return null;

    if (typeof result === 'string') {
      return { output: result, success: true };
    }

    if (typeof result === 'object') {
      return {
        output: result.output || result.rawOutput || '',
        error: result.error || '',
        success: result.success ?? !result.hasError,
        executionTime: result.executionTime,
        memoryUsed: result.memoryUsed,
        exitCode: result.exitCode,
      };
    }

    return { output: String(result), success: true };
  }, []);

  const parsedResult = parseResult(currentResult);

  const tabs = [
    { id: 'output', label: 'Output', icon: '📄' },
    { id: 'history', label: 'History', icon: '📚' },
    { id: 'input', label: 'Input', icon: '⌨️' },
  ];

  return (
    <div className={clsx('flex flex-col h-full bg-code border-t border-primary', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-primary">
        <div className="flex items-center space-x-4">
          {/* Tabs */}
          <div className="flex items-center space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center space-x-1 px-3 py-1 rounded text-sm transition-colors',
                  activeTab === tab.id
                    ? 'bg-accent text-white'
                    : 'text-secondary hover:text-primary hover:bg-tertiary'
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Language Badge */}
          <div className="flex items-center space-x-2 px-2 py-1 bg-tertiary rounded">
            <span>{getLanguageIcon(language)}</span>
            <span className="text-xs text-secondary capitalize">{language}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Execution Status */}
          {isExecuting && (
            <div className="flex items-center space-x-2 px-2 py-1 bg-warning/20 rounded">
              <LoadingSpinner size="xs" />
              <span className="text-xs text-warning">Executing...</span>
            </div>
          )}

          {/* Clear Output */}
          <button
            onClick={handleClearOutput}
            disabled={isClearing || (history.length === 0 && !currentResult)}
            className="btn-ghost btn-sm"
            title="Clear Output"
          >
            {isClearing ? <LoadingSpinner size="xs" /> : '🗑️'}
          </button>

          {/* Copy Output */}
          <button
            onClick={handleCopyOutput}
            disabled={!currentResult}
            className="btn-ghost btn-sm"
            title="Copy Output"
          >
            📋
          </button>

          {/* Execute Button */}
          <button
            onClick={handleExecute}
            disabled={!canExecute || isExecuting}
            className="btn-primary btn-sm flex items-center space-x-1"
            title="Execute Code (Ctrl+Enter)"
          >
            <span>▶</span>
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {/* Output Tab */}
        {activeTab === 'output' && (
          <div className="h-full flex flex-col">
            <div 
              ref={outputRef}
              className="flex-1 overflow-y-auto p-4 font-code scrollbar-thin"
              style={{ fontSize: `${fontSize}px` }}
            >
              {isExecuting ? (
                <div className="flex items-center space-x-3 text-warning">
                  <LoadingSpinner size="sm" />
                  <span>Executing code...</span>
                  {executedBy && executedBy !== 'You' && (
                    <span className="text-secondary">by {executedBy}</span>
                  )}
                </div>
              ) : parsedResult ? (
                <div className="space-y-4">
                  {/* Execution Info */}
                  <div className="flex items-center justify-between text-xs text-secondary border-b border-primary pb-2">
                    <div className="flex items-center space-x-4">
                      <span>Language: {language}</span>
                      {parsedResult.executionTime && (
                        <span>Time: {formatExecutionTime(parsedResult.executionTime)}</span>
                      )}
                      {parsedResult.memoryUsed && (
                        <span>Memory: {formatMemoryUsage(parsedResult.memoryUsed)}</span>
                      )}
                      {parsedResult.exitCode !== undefined && (
                        <span>Exit Code: {parsedResult.exitCode}</span>
                      )}
                    </div>
                    {executedBy && executedBy !== 'You' && (
                      <span>Executed by {executedBy}</span>
                    )}
                  </div>

                  {/* Output */}
                  {parsedResult.output && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-success">Output:</div>
                      <pre className="whitespace-pre-wrap text-primary bg-tertiary/50 p-3 rounded border-l-4 border-success">
                        {parsedResult.output}
                      </pre>
                    </div>
                  )}

                  {/* Error */}
                  {(parsedResult.error || currentError) && (
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-error">Error:</div>
                      <pre className="whitespace-pre-wrap text-error bg-error/10 p-3 rounded border-l-4 border-error">
                        {parsedResult.error || currentError}
                      </pre>
                    </div>
                  )}

                  {/* No Output */}
                  {!parsedResult.output && !parsedResult.error && !currentError && (
                    <div className="text-secondary italic">
                      Code executed successfully with no output.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-secondary py-8">
                  <div className="text-4xl mb-4">▶️</div>
                  <p className="text-lg mb-2">Ready to execute code</p>
                  <p className="text-sm">
                    Click the Run button or press Ctrl+Enter to execute your code
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="h-full overflow-y-auto p-4 scrollbar-thin">
            {history.length === 0 ? (
              <div className="text-center text-secondary py-8">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-lg mb-2">No execution history</p>
                <p className="text-sm">
                  Your code execution history will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((execution, index) => {
                  const parsed = parseResult(execution.result);
                  return (
                    <div 
                      key={execution.id}
                      className="bg-secondary rounded-lg p-4 border border-primary"
                    >
                      {/* Execution Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <span>{getLanguageIcon(execution.language)}</span>
                          <span className="font-medium text-primary">
                            Execution #{history.length - index}
                          </span>
                          <span className="text-secondary">
                            by {execution.executedBy}
                          </span>
                        </div>
                        <span className="text-xs text-secondary">
                          {format(execution.timestamp, 'HH:mm:ss')}
                        </span>
                      </div>

                      {/* Execution Details */}
                      {parsed && (
                        <div className="space-y-2">
                          {/* Stats */}
                          <div className="flex items-center space-x-4 text-xs text-secondary">
                            {parsed.executionTime && (
                              <span>⏱️ {formatExecutionTime(parsed.executionTime)}</span>
                            )}
                            {parsed.memoryUsed && (
                              <span>💾 {formatMemoryUsage(parsed.memoryUsed)}</span>
                            )}
                            <span className={clsx(
                              'px-2 py-1 rounded',
                              parsed.success ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                            )}>
                              {parsed.success ? '✅ Success' : '❌ Error'}
                            </span>
                          </div>

                          {/* Input */}
                          {execution.input && (
                            <div>
                              <div className="text-xs font-medium text-secondary mb-1">Input:</div>
                              <pre className="text-xs bg-tertiary p-2 rounded font-code">
                                {execution.input}
                              </pre>
                            </div>
                          )}

                          {/* Output/Error */}
                          {(parsed.output || parsed.error) && (
                            <div>
                              <div className="text-xs font-medium text-secondary mb-1">
                                {parsed.error ? 'Error:' : 'Output:'}
                              </div>
                              <pre className={clsx(
                                'text-xs p-2 rounded font-code max-h-24 overflow-y-auto scrollbar-thin',
                                parsed.error ? 'bg-error/10 text-error' : 'bg-tertiary text-primary'
                              )}>
                                {parsed.error || parsed.output}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Input Tab */}
        {activeTab === 'input' && (
          <div className="h-full flex flex-col p-4">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-primary mb-2">Program Input</h3>
              <p className="text-xs text-secondary">
                Provide input that will be passed to your program via stdin
              </p>
            </div>

            <form onSubmit={handleInputSubmit} className="flex-1 flex flex-col">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                className="flex-1 input resize-none font-code"
                style={{ fontSize: `${fontSize}px` }}
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-secondary">
                  {input.split('\n').length} lines, {input.length} characters
                </div>
                
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setInput('')}
                    className="btn-ghost btn-sm"
                    disabled={!input}
                  >
                    Clear
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!canExecute || isExecuting}
                    className="btn-primary btn-sm"
                  >
                    {isExecuting ? (
                      <LoadingSpinner size="xs" color="white" text="Running..." />
                    ) : (
                      'Run with Input'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Quick Input Toggle */}
      {activeTab === 'output' && (
        <div className="border-t border-primary">
          <button
            onClick={() => setShowInput(!showInput)}
            className="w-full px-4 py-2 text-left text-sm text-secondary hover:text-primary hover:bg-tertiary transition-colors"
          >
            <div className="flex items-center justify-between">
              <span>Program Input {input && `(${input.split('\n').length} lines)`}</span>
              <span>{showInput ? '🔽' : '▶️'}</span>
            </div>
          </button>
          
          {showInput && (
            <div className="border-t border-primary p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input for your program..."
                className="w-full h-20 input resize-none font-code text-sm"
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleExecute();
                  }
                }}
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleExecute}
                  disabled={!canExecute || isExecuting}
                  className="btn-primary btn-sm"
                >
                  Run with Input
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExecutionPanel;