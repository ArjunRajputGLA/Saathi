'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as math from 'mathjs';
import { useSession } from 'next-auth/react';

const Calculator: React.FC = () => {
  const { data: session } = useSession();
  const calcRef = useRef<HTMLDivElement>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcThoughtText, setCalcThoughtText] = useState('');
  const [isHoveringCalc, setIsHoveringCalc] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isScientificMode, setIsScientificMode] = useState(false);
  const [memory, setMemory] = useState(0);
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Typewriter effect for calculator thought bubble
  useEffect(() => {
    if (!isHoveringCalc) {
      setCalcThoughtText('');
      return;
    }

    const fullText = 'Advanced calculator with scientific functions!';
    let currentIndex = 0;

    const typeWriter = setInterval(() => {
      if (currentIndex < fullText.length) {
        setCalcThoughtText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeWriter);
      }
    }, 50);

    return () => clearInterval(typeWriter);
  }, [isHoveringCalc]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isCalcOpen && calcRef.current && !calcRef.current.contains(event.target as Node)) {
        setIsCalcOpen(false);
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalcOpen]);

  // Helper function to auto-complete brackets
  const autoCompleteBrackets = (expression: string): string => {
    let openCount = 0;
    for (let char of expression) {
      if (char === '(') openCount++;
      if (char === ')') openCount--;
    }
    return expression + ')'.repeat(Math.max(0, openCount));
  };

  // Helper function to evaluate expression safely using mathjs
  const evaluateExpression = (expr: string): string => {
    try {
      // Auto-complete any missing brackets
      let expression = autoCompleteBrackets(expr);

      // Replace constants and operators
      expression = expression
        .replace(/π/g, 'pi')
        .replace(/e(?![0-9])/g, 'e')
        .replace(/\^/g, '**');

      // Handle implicit multiplication
      expression = expression.replace(/(\d)(pi|e)/g, '$1*$2');
      expression = expression.replace(/(pi|e)(\d)/g, '$1*$2');

      // Replace log with log10
      expression = expression.replace(/log\(/g, 'log10(');

      // Handle trigonometric functions based on angle mode
      if (angleMode === 'deg') {
        // Add closing parenthesis for trig functions
        expression = expression
          .replace(/sin\((.*?)(?=\)|$)/g, (_, args) => `sin((${args})*pi/180)`)
          .replace(/cos\((.*?)(?=\)|$)/g, (_, args) => `cos((${args})*pi/180)`)
          .replace(/tan\((.*?)(?=\)|$)/g, (_, args) => `tan((${args})*pi/180)`);
      }

      // Create scope for mathjs evaluation
      const scope = {
        pi: math.pi,
        e: math.e
      };

      // Evaluate using mathjs
      const result = math.evaluate(expression, scope);

      if (!Number.isFinite(result)) {
        return 'Error';
      }

      // Format result to avoid very long decimals
      if (Math.abs(result) < 1e-10 && result !== 0) {
        return '0';
      }

      // Round to reasonable precision
      const rounded = Math.round(result * 1e10) / 1e10;
      return rounded.toString();
    } catch (error) {
      console.error('Evaluation error:', error);
      return 'Error';
    }
  };

  // Enhanced calculator logic
  const handleCalcButtonClick = (value: string): void => {
    if (value === 'C') {
      setCalcDisplay('0');
      return;
    }

    if (value === 'AC') {
      setCalcDisplay('0');
      setHistory([]);
      setMemory(0);
      return;
    }

    if (value === '=') {
      const result = evaluateExpression(calcDisplay);
      
      // Add to history only if calculation was successful
      if (result !== 'Error') {
        const historyEntry = `${calcDisplay} = ${result}`;
        setHistory(prev => [historyEntry, ...prev.slice(0, 9)]); // Keep last 10 entries
      }
      
      setCalcDisplay(result);
      return;
    }

    // Memory functions
    if (value === 'MC') {
      setMemory(0);
      return;
    }
    if (value === 'MR') {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        setCalcDisplay(memory.toString());
      } else {
        setCalcDisplay(calcDisplay + memory.toString());
      }
      return;
    }
    if (value === 'M+') {
      try {
        const result = evaluateExpression(calcDisplay);
        if (result !== 'Error') {
          const current = parseFloat(result);
          setMemory(prev => prev + current);
        }
      } catch {}
      return;
    }
    if (value === 'M-') {
      try {
        const result = evaluateExpression(calcDisplay);
        if (result !== 'Error') {
          const current = parseFloat(result);
          setMemory(prev => prev - current);
        }
      } catch {}
      return;
    }

    // Special functions - add opening bracket automatically
    if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt('].includes(value)) {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        setCalcDisplay(value);
      } else {
        // Add multiplication if needed (e.g., 2sin( becomes 2*sin()
        const lastChar = calcDisplay.slice(-1);
        if (/\d|π|e|\)/.test(lastChar)) {
          setCalcDisplay(calcDisplay + '*' + value);
        } else {
          setCalcDisplay(calcDisplay + value);
        }
      }
      return;
    }

    // Constants
    if (value === 'π') {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        setCalcDisplay('π');
      } else {
        const lastChar = calcDisplay.slice(-1);
        // Add multiplication if needed (e.g., 2π becomes 2*π)
        if (/\d|\)/.test(lastChar)) {
          setCalcDisplay(calcDisplay + '*π');
        } else {
          setCalcDisplay(calcDisplay + 'π');
        }
      }
      return;
    }

    if (value === 'e') {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        setCalcDisplay('e');
      } else {
        const lastChar = calcDisplay.slice(-1);
        // Add multiplication if needed (e.g., 2e becomes 2*e)
        if (/\d|\)/.test(lastChar)) {
          setCalcDisplay(calcDisplay + '*e');
        } else {
          setCalcDisplay(calcDisplay + 'e');
        }
      }
      return;
    }

    // Backspace
    if (value === '⌫') {
      if (calcDisplay.length > 1 && calcDisplay !== 'Error') {
        setCalcDisplay(calcDisplay.slice(0, -1));
      } else {
        setCalcDisplay('0');
      }
      return;
    }

    // Handle operators - prevent multiple consecutive operators
    if (['+', '-', '*', '/', '^'].includes(value)) {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        if (value === '-') {
          setCalcDisplay('-');
        }
        return;
      }
      
      const lastChar = calcDisplay.slice(-1);
      if (['+', '-', '*', '/', '^', '('].includes(lastChar)) {
        // Replace the last operator with the new one
        if (value === '-' && lastChar !== '-') {
          setCalcDisplay(calcDisplay + value);
        } else if (lastChar !== '(') {
          setCalcDisplay(calcDisplay.slice(0, -1) + value);
        }
        return;
      }
      
      setCalcDisplay(calcDisplay + value);
      return;
    }

    // Handle decimal point
    if (value === '.') {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        setCalcDisplay('0.');
        return;
      }
      
      // Check if current number already has a decimal point
      const parts = calcDisplay.split(/[+\-*/^()]/);
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('.')) {
        setCalcDisplay(calcDisplay + '.');
      }
      return;
    }

    // Handle parentheses
    if (value === '(' || value === ')') {
      if (calcDisplay === '0' || calcDisplay === 'Error') {
        if (value === '(') {
          setCalcDisplay('(');
        }
        return;
      }
      
      if (value === '(') {
        const lastChar = calcDisplay.slice(-1);
        // Add multiplication if needed (e.g., 2( becomes 2*()
        if (/\d|\)|π|e/.test(lastChar)) {
          setCalcDisplay(calcDisplay + '*(');
        } else {
          setCalcDisplay(calcDisplay + '(');
        }
      } else {
        // Only add closing bracket if there are unmatched opening brackets
        let openCount = 0;
        for (let char of calcDisplay) {
          if (char === '(') openCount++;
          if (char === ')') openCount--;
        }
        if (openCount > 0) {
          setCalcDisplay(calcDisplay + ')');
        }
      }
      return;
    }

    // Regular number input
    if (calcDisplay === '0' || calcDisplay === 'Error') {
      setCalcDisplay(value);
    } else {
      setCalcDisplay(calcDisplay + value);
    }
  };

  // Basic calculator buttons
  const basicButtons = [
    'C', '⌫', '(', ')',
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    '0', '.', '=', '+'
  ];

  // Scientific calculator buttons
  const scientificButtons = [
    'AC', 'MC', 'MR', 'M+', 'M-',
    'sin(', 'cos(', 'tan(', 'π', 'e',
    'log(', 'ln(', 'sqrt(', '^', '(',
    '7', '8', '9', '/', ')',
    '4', '5', '6', '*', '⌫',
    '1', '2', '3', '-', '=',
    '0', '.', '+', 'C'
  ];

  // Theme-based styles
  const themeStyles = {
    button: {
      background: theme === 'light' 
        ? 'linear-gradient(45deg, #5750F1, #7B74F7)' 
        : 'linear-gradient(45deg, #2B2A6D, #4A489E)',
      color: '#ffffff',
    },
    thoughtBubble: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#2d3748',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
      boxShadow: `0 4px 15px rgba(0, 0, 0, ${theme === 'light' ? '0.15' : '0.3'})`,
      zIndex: 1001,
    },
    calcContainer: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
      boxShadow: `0 6px 20px rgba(0, 0, 0, ${theme === 'light' ? '0.2' : '0.5'})`,
    },
    calcDisplay: {
      backgroundColor: theme === 'light' ? '#f9fafb' : '#374151',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
      border: `2px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`,
    },
    calcButton: {
      backgroundColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
    },
    calcButtonOperator: {
      backgroundColor: theme === 'light' ? '#5750F1' : '#4A489E',
      color: '#ffffff',
    },
    calcButtonFunction: {
      backgroundColor: theme === 'light' ? '#059669' : '#047857',
      color: '#ffffff',
    },
    calcButtonMemory: {
      backgroundColor: theme === 'light' ? '#dc2626' : '#b91c1c',
      color: '#ffffff',
    }
  };

  const getButtonStyle = (btn: string) => {
    if (['MC', 'MR', 'M+', 'M-'].includes(btn)) return themeStyles.calcButtonMemory;
    if (['sin(', 'cos(', 'tan(', 'log(', 'ln(', 'sqrt(', 'π', 'e', '^'].includes(btn)) return themeStyles.calcButtonFunction;
    if (btn.match(/[/*\-+=]/)) return themeStyles.calcButtonOperator;
    return themeStyles.calcButton;
  };

  // If user is not logged in, don't render the calculator
  if (!session) {
    return null;
  }

  return (
    <div 
      ref={calcRef}
      style={{ position: 'fixed', bottom: '120px', right: '20px', zIndex: 999 }}
    >
      <style>{`
        @keyframes floatCalc {
          0% { transform: translateY(0px) scale(${isHoveringCalc ? '1.15' : '1'}); }
          50% { transform: translateY(-8px) scale(${isHoveringCalc ? '1.15' : '1'}); }
          100% { transform: translateY(0px) scale(${isHoveringCalc ? '1.15' : '1'}); }
        }
        @keyframes bubbleFadeIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .calc-button {
          transition: all 0.2s ease !important;
        }
        .calc-button:hover {
          transform: scale(1.05) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        .calc-button:active {
          transform: scale(0.95) !important;
        }
      `}</style>
      
      <button
        onClick={() => setIsCalcOpen(!isCalcOpen)}
        onMouseEnter={() => setIsHoveringCalc(true)}
        onMouseLeave={() => setIsHoveringCalc(false)}
        style={{
          background: themeStyles.button.background,
          border: 'none',
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          cursor: 'pointer',
          boxShadow: `0 6px 20px ${theme === 'light' ? 'rgba(87, 80, 241, 0.4)' : 'rgba(74, 72, 158, 0.4)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          animation: 'floatCalc 3s ease-in-out infinite',
          animationDelay: '0.2s',
          transform: isHoveringCalc ? 'scale(1.15)' : 'none',
        }}
        aria-label="Toggle calculator"
      >
        <span style={{ fontSize: '24px', color: 'white' }}>🔢</span>
      </button>
      
      {isHoveringCalc && !isCalcOpen && (
        <div
          style={{
            ...themeStyles.thoughtBubble,
            position: 'absolute',
            bottom: '70px',
            right: '0',
            padding: '10px 15px',
            borderRadius: '15px',
            fontSize: '14px',
            maxWidth: '300px',
            animation: 'bubbleFadeIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <span>{calcThoughtText}</span>
          {calcThoughtText.length < 'Advanced calculator with scientific functions!'.length && (
            <span style={{ marginLeft: '5px', animation: 'blink 1s step-end infinite' }}>|</span>
          )}
        </div>
      )}
      
      {isCalcOpen && (
        <div
          style={{
            ...themeStyles.calcContainer,
            position: 'absolute',
            bottom: '70px',
            right: '0',
            width: isScientificMode ? '320px' : '260px',
            padding: '15px',
            borderRadius: '20px',
            animation: 'bubbleFadeIn 0.3s ease-out',
            zIndex: 1002,
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '10px',
            paddingBottom: '10px',
            borderBottom: `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`
          }}>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="calc-button"
                style={{
                  ...themeStyles.calcButton,
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="calc-button"
                style={{
                  ...themeStyles.calcButton,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                📜
              </button>
            </div>
            <button
              onClick={() => setIsScientificMode(!isScientificMode)}
              className="calc-button"
              style={{
                ...themeStyles.calcButtonFunction,
                padding: '5px 10px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold',
              }}
            >
              {isScientificMode ? 'BASIC' : 'SCI'}
            </button>
          </div>

          {/* Scientific mode controls */}
          {isScientificMode && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '10px',
              fontSize: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Angle:</span>
                <button
                  onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
                  className="calc-button"
                  style={{
                    ...themeStyles.calcButtonFunction,
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '10px',
                  }}
                >
                  {angleMode.toUpperCase()}
                </button>
              </div>
              <div style={{ fontSize: '10px' }}>
                M: {memory !== 0 ? memory.toFixed(2) : '0'}
              </div>
            </div>
          )}

          {/* History panel */}
          {showHistory && (
            <div style={{
              ...themeStyles.calcDisplay,
              maxHeight: '120px',
              overflowY: 'auto',
              marginBottom: '10px',
              padding: '8px',
              borderRadius: '8px',
              fontSize: '12px',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>History:</div>
              {history.length === 0 ? (
                <div style={{ opacity: '0.6' }}>No calculations yet</div>
              ) : (
                history.map((entry, index) => (
                  <div key={index} style={{ 
                    marginBottom: '3px', 
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                  }}
                  onClick={() => {
                    const result = entry.split(' = ')[1];
                    setCalcDisplay(result);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme === 'light' ? '#f3f4f6' : '#4b5563';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  >
                    {entry}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Display */}
          <div style={{
              ...themeStyles.calcDisplay,
              padding: '15px',
              borderRadius: '12px',
              fontSize: '20px',
              textAlign: 'right',
              marginBottom: '15px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              minHeight: '50px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontFamily: 'monospace',
              fontWeight: 'bold',
            }}
          >
            {calcDisplay}
          </div>

          {/* Button grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isScientificMode ? 'repeat(5, 1fr)' : 'repeat(4, 1fr)', 
            gap: '8px' 
          }}>
            {(isScientificMode ? scientificButtons : basicButtons).map((btn) => (
              <button
                key={btn}
                onClick={() => handleCalcButtonClick(btn)}
                className="calc-button"
                style={{
                  ...getButtonStyle(btn),
                  padding: '12px 8px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: btn.length > 3 ? '11px' : '14px',
                  fontWeight: '600',
                  gridColumn: btn === '0' && !isScientificMode ? 'span 2' : 'span 1',
                }}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;