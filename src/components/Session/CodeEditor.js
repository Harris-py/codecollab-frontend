// src/components/Session/CodeEditor.js
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { useCodeEditorSocket } from '../../hooks/useSocket';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../Common/LoadingSpinner';
import { clsx } from 'clsx';

const CodeEditor = ({ 
  sessionId, 
  language = 'javascript', 
  onCodeChange, 
  onExecute,
  readOnly = false,
  className 
}) => {
  const { user } = useAuth();
  const { theme, fontSize, codeFont } = useTheme();
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [code, setCode] = useState('');
  const [cursors, setCursors] = useState(new Map());
  const [selections, setSelections] = useState(new Map());
  const [decorations, setDecorations] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const lastChangeRef = useRef(null);
  const suppressNextChangeRef = useRef(false);

  // Socket integration for real-time collaboration
  const { sendCodeChange, sendCursorPosition, isConnected } = useCodeEditorSocket(
    sessionId,
    useCallback((newCode, operation, from) => {
      if (from !== 'self' && editorRef.current && !suppressNextChangeRef.current) {
        suppressNextChangeRef.current = true;
        editorRef.current.setValue(newCode);
        setCode(newCode);
        suppressNextChangeRef.current = false;
      }
    }, [])
  );

  // Language templates
  const getLanguageTemplate = useCallback((lang) => {
    const templates = {
      javascript: '// Welcome to CodeCollab - JavaScript Session\n// Start coding together in real-time!\n\nconsole.log("Hello, World!");\n\n// Try writing some code here...\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nconsole.log("Fibonacci(10):", fibonacci(10));',
      python: '# Welcome to CodeCollab - Python Session\n# Start coding together in real-time!\n\nprint("Hello, World!")\n\n# Try writing some code here...\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint(f"Fibonacci(10): {fibonacci(10)}")',
      cpp: '// Welcome to CodeCollab - C++ Session\n// Start coding together in real-time!\n\n#include <iostream>\nusing namespace std;\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    cout << "Hello, World!" << endl;\n    cout << "Fibonacci(10): " << fibonacci(10) << endl;\n    return 0;\n}',
      c: '// Welcome to CodeCollab - C Session\n// Start coding together in real-time!\n\n#include <stdio.h>\n\nint fibonacci(int n) {\n    if (n <= 1) return n;\n    return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\nint main() {\n    printf("Hello, World!\\n");\n    printf("Fibonacci(10): %d\\n", fibonacci(10));\n    return 0;\n}',
      java: '// Welcome to CodeCollab - Java Session\n// Start coding together in real-time!\n\npublic class Main {\n    public static int fibonacci(int n) {\n        if (n <= 1) return n;\n        return fibonacci(n - 1) + fibonacci(n - 2);\n    }\n    \n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n        System.out.println("Fibonacci(10): " + fibonacci(10));\n    }\n}',
      go: '// Welcome to CodeCollab - Go Session\n// Start coding together in real-time!\n\npackage main\n\nimport "fmt"\n\nfunc fibonacci(n int) int {\n    if n <= 1 {\n        return n\n    }\n    return fibonacci(n-1) + fibonacci(n-2)\n}\n\nfunc main() {\n    fmt.Println("Hello, World!")\n    fmt.Printf("Fibonacci(10): %d\\n", fibonacci(10))\n}',
      rust: '// Welcome to CodeCollab - Rust Session\n// Start coding together in real-time!\n\nfn fibonacci(n: u32) -> u32 {\n    match n {\n        0 | 1 => n,\n        _ => fibonacci(n - 1) + fibonacci(n - 2),\n    }\n}\n\nfn main() {\n    println!("Hello, World!");\n    println!("Fibonacci(10): {}", fibonacci(10));\n}'
    };
    return templates[lang] || templates.javascript;
  }, []);

  // Initialize editor with template when language changes
  useEffect(() => {
    if (isEditorReady && !code) {
      const template = getLanguageTemplate(language);
      setCode(template);
      if (editorRef.current) {
        editorRef.current.setValue(template);
      }
    }
  }, [language, isEditorReady, code, getLanguageTemplate]);

  // Handle editor mount
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setIsEditorReady(true);

    // Configure editor
    editor.updateOptions({
      fontSize: fontSize,
      fontFamily: codeFont,
      wordWrap: 'on',
      minimap: { enabled: true },
      lineNumbers: 'on',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderWhitespace: 'selection',
      scrollBeyondLastLine: false,
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      parameterHints: { enabled: true },
      formatOnPaste: true,
      formatOnType: true,
    });

    // Handle cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (!readOnly && isConnected) {
        const position = {
          line: e.position.lineNumber,
          column: e.position.column
        };
        sendCursorPosition(position);
      }
    });

    // Handle selection changes
    editor.onDidChangeCursorSelection((e) => {
      if (!readOnly && isConnected) {
        const selection = {
          start: {
            line: e.selection.startLineNumber,
            column: e.selection.startColumn
          },
          end: {
            line: e.selection.endLineNumber,
            column: e.selection.endColumn
          }
        };
        // You can extend this to send selection data
      }
    });

    // Handle content changes
    editor.onDidChangeModelContent((e) => {
      if (suppressNextChangeRef.current) {
        return;
      }

      const newCode = editor.getValue();
      setCode(newCode);
      
      // Debounce typing indicator
      setIsTyping(true);
      if (lastChangeRef.current) {
        clearTimeout(lastChangeRef.current);
      }
      lastChangeRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);

      // Send code changes to other users
      if (!readOnly && isConnected) {
        const operation = {
          type: 'edit',
          changes: e.changes,
          timestamp: Date.now()
        };
        sendCodeChange(newCode, operation);
      }

      // Notify parent component
      onCodeChange?.(newCode);
    });

    // Add keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute?.(editor.getValue());
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Handle save (could trigger auto-save)
      console.log('Auto-save triggered');
    });

    // Set initial code
    const template = getLanguageTemplate(language);
    editor.setValue(template);
    setCode(template);

  }, [fontSize, codeFont, language, readOnly, isConnected, sendCodeChange, sendCursorPosition, onCodeChange, onExecute, getLanguageTemplate]);

  // Update theme when changed
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(theme === 'dark' ? 'vs-dark' : 'vs-light');
    }
  }, [theme]);

  // Update font settings when changed
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({
        fontSize: fontSize,
        fontFamily: codeFont,
      });
    }
  }, [fontSize, codeFont]);

  // Update decorations for cursors and selections
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const newDecorations = [];
    
    // Add cursor decorations
    cursors.forEach((cursor, userId) => {
      if (userId !== user?.id) {
        newDecorations.push({
          range: new monacoRef.current.Range(
            cursor.position.line,
            cursor.position.column,
            cursor.position.line,
            cursor.position.column
          ),
          options: {
            className: 'cursor-indicator',
            stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            afterContentClassName: 'cursor-label',
            after: {
              content: cursor.username,
              inlineClassName: `cursor-user-${Math.abs(userId.hashCode()) % 6 + 1}`
            }
          }
        });
      }
    });

    // Add selection decorations
    selections.forEach((selection, userId) => {
      if (userId !== user?.id && selection.start && selection.end) {
        newDecorations.push({
          range: new monacoRef.current.Range(
            selection.start.line,
            selection.start.column,
            selection.end.line,
            selection.end.column
          ),
          options: {
            className: `selection-highlight-${Math.abs(userId.hashCode()) % 6 + 1}`,
            stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        });
      }
    });

    const oldDecorations = decorations.map(d => d.id).filter(Boolean);
    const newDecorationIds = editorRef.current.deltaDecorations(oldDecorations, newDecorations);
    setDecorations(newDecorationIds.map((id, index) => ({ id, ...newDecorations[index] })));

  }, [cursors, selections, user?.id, decorations]);

  // Get editor options based on language
  const getEditorOptions = useCallback(() => {
    const baseOptions = {
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: readOnly,
      cursorStyle: 'line',
      automaticLayout: true,
      scrollbar: {
        useShadows: false,
        verticalHasArrows: true,
        horizontalHasArrows: true,
        vertical: 'visible',
        horizontal: 'visible',
        verticalScrollbarSize: 14,
        horizontalScrollbarSize: 14
      }
    };

    // Language-specific options
    switch (language) {
      case 'python':
        return {
          ...baseOptions,
          tabSize: 4,
          insertSpaces: true,
        };
      case 'javascript':
      case 'typescript':
        return {
          ...baseOptions,
          tabSize: 2,
          insertSpaces: true,
        };
      default:
        return {
          ...baseOptions,
          tabSize: 2,
          insertSpaces: true,
        };
    }
  }, [language, readOnly]);

  // Handle editor loading
  const handleEditorLoading = useCallback(() => {
    return (
      <div className="flex items-center justify-center h-full bg-code">
        <LoadingSpinner size="lg" text="Loading editor..." centered />
      </div>
    );
  }, []);

  // Language display mapping
  const getLanguageDisplay = useCallback((lang) => {
    const mapping = {
      javascript: 'JavaScript',
      python: 'Python',
      cpp: 'C++',
      c: 'C',
      java: 'Java',
      go: 'Go',
      rust: 'Rust',
      typescript: 'TypeScript',
    };
    return mapping[lang] || lang;
  }, []);

  return (
    <div className={clsx('flex flex-col h-full bg-code border border-primary rounded-lg overflow-hidden', className)}>
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-secondary border-b border-primary">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <div className="w-3 h-3 bg-success rounded-full"></div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-primary">main.{language === 'cpp' ? 'cpp' : language === 'c' ? 'c' : language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'go' ? 'go' : language === 'rust' ? 'rs' : 'js'}</span>
            <span className="text-xs text-secondary">•</span>
            <span className="text-xs text-secondary">{getLanguageDisplay(language)}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={clsx(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-success' : 'bg-error'
            )}></div>
            <span className="text-xs text-secondary">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center space-x-1">
              <div className="typing-indicator">
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
              <span className="text-xs text-secondary">Typing...</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onExecute?.(code)}
              className="btn-ghost btn-sm flex items-center space-x-1"
              disabled={!code.trim()}
            >
              <span>▶</span>
              <span>Run</span>
              <span className="text-xs opacity-60">(Ctrl+Enter)</span>
            </button>
            
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(code);
                }
              }}
              className="btn-ghost btn-sm"
              title="Copy code"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
          loading={handleEditorLoading()}
          options={getEditorOptions()}
          onMount={handleEditorDidMount}
          beforeMount={(monaco) => {
            // Configure Monaco themes and languages
            monaco.editor.defineTheme('codecollab-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'comment', foreground: 'a0a0c0', fontStyle: 'italic' },
                { token: 'keyword', foreground: '667eea', fontStyle: 'bold' },
                { token: 'string', foreground: '10b981' },
                { token: 'number', foreground: 'f59e0b' },
              ],
              colors: {
                'editor.background': '#262640',
                'editor.foreground': '#ffffff',
                'editor.lineHighlightBackground': '#1a1a3a',
                'editorCursor.foreground': '#667eea',
                'editor.selectionBackground': '#667eea33',
              }
            });

            monaco.editor.defineTheme('codecollab-light', {
              base: 'vs',
              inherit: true,
              rules: [
                { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
                { token: 'keyword', foreground: '667eea', fontStyle: 'bold' },
                { token: 'string', foreground: '10b981' },
                { token: 'number', foreground: 'f59e0b' },
              ],
              colors: {
                'editor.background': '#f7fafc',
                'editor.foreground': '#1a202c',
                'editor.lineHighlightBackground': '#edf2f7',
                'editorCursor.foreground': '#667eea',
                'editor.selectionBackground': '#667eea33',
              }
            });
          }}
        />

        {/* Collaborative Cursors Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from(cursors.entries()).map(([userId, cursor]) => {
            if (userId === user?.id) return null;
            
            return (
              <div
                key={userId}
                className="absolute z-10"
                style={{
                  top: `${cursor.position.line * 19}px`, // Approximate line height
                  left: `${cursor.position.column * 7.2}px`, // Approximate character width
                }}
              >
                <div className={`cursor-indicator participant-${Math.abs(userId.hashCode()) % 6 + 1}`}>
                  <div className="cursor-label">
                    {cursor.username}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Read-only overlay */}
        {readOnly && (
          <div className="absolute inset-0 bg-overlay flex items-center justify-center z-20">
            <div className="bg-secondary border border-primary rounded-lg p-6 text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-medium text-primary mb-2">Read-only Mode</h3>
              <p className="text-secondary">
                You don't have permission to edit this session
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-tertiary border-t border-primary text-xs">
        <div className="flex items-center space-x-4">
          <span className="text-secondary">
            Lines: {code.split('\n').length}
          </span>
          <span className="text-secondary">
            Characters: {code.length}
          </span>
          <span className="text-secondary">
            Language: {getLanguageDisplay(language)}
          </span>
        </div>
        
        <div className="flex items-center space-x-4">
          {cursors.size > 0 && (
            <span className="text-secondary">
              {cursors.size} active cursor{cursors.size !== 1 ? 's' : ''}
            </span>
          )}
          
          <span className="text-secondary">
            UTF-8
          </span>
        </div>
      </div>

      {/* Custom styles for collaboration features */}
      <style jsx>{`
        .cursor-indicator {
          width: 2px;
          height: 18px;
          position: relative;
          animation: pulse-accent 1.5s ease-in-out infinite;
        }
        
        .cursor-label {
          position: absolute;
          top: -24px;
          left: -20px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          color: white;
          white-space: nowrap;
          pointer-events: none;
          z-index: 100;
        }
        
        .participant-1 .cursor-indicator { background-color: var(--cursor-user-1); }
        .participant-1 .cursor-label { background-color: var(--cursor-user-1); }
        .participant-2 .cursor-indicator { background-color: var(--cursor-user-2); }
        .participant-2 .cursor-label { background-color: var(--cursor-user-2); }
        .participant-3 .cursor-indicator { background-color: var(--cursor-user-3); }
        .participant-3 .cursor-label { background-color: var(--cursor-user-3); }
        .participant-4 .cursor-indicator { background-color: var(--cursor-user-4); }
        .participant-4 .cursor-label { background-color: var(--cursor-user-4); }
        .participant-5 .cursor-indicator { background-color: var(--cursor-user-5); }
        .participant-5 .cursor-label { background-color: var(--cursor-user-5); }
        .participant-6 .cursor-indicator { background-color: var(--cursor-user-6); }
        .participant-6 .cursor-label { background-color: var(--cursor-user-6); }
        
        .selection-highlight-1 { background-color: var(--cursor-user-1); opacity: 0.2; }
        .selection-highlight-2 { background-color: var(--cursor-user-2); opacity: 0.2; }
        .selection-highlight-3 { background-color: var(--cursor-user-3); opacity: 0.2; }
        .selection-highlight-4 { background-color: var(--cursor-user-4); opacity: 0.2; }
        .selection-highlight-5 { background-color: var(--cursor-user-5); opacity: 0.2; }
        .selection-highlight-6 { background-color: var(--cursor-user-6); opacity: 0.2; }
      `}</style>
    </div>
  );
};

// Helper function for string hashing (for consistent user colors)
String.prototype.hashCode = function() {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export default CodeEditor;