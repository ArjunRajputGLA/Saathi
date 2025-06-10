'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

const Chatbot = () => {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnlarged, setIsEnlarged] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [messages, setMessages] = useState<{ user?: string; bot: string }[]>([]);
  const [input, setInput] = useState('');
  const [thoughtText, setThoughtText] = useState('');
  const [isHoveringChatbot, setIsHoveringChatbot] = useState(false);
  const chatbotRef = useRef<HTMLDivElement>(null);

  // Extract firstName from session
  const firstName = session?.user?.firstName || 'User';

  // Initialize with welcome message when chatbot opens
  useEffect(() => {
    if (isOpen && messages.length === 0 && status === 'authenticated') {
      setMessages([{ bot: `Hello ${firstName}! Welcome to your Saathi. How can I help you today?` }]);
    }
  }, [isOpen, firstName, messages.length, status]);

  // Update the hover effect useEffect
  useEffect(() => {
    if (!isHoveringChatbot) {
      setThoughtText('');
      return;
    }

    const fullText = 'Hey there, I am your Saathi, do you have any queries?';
    let currentIndex = 0;

    const typeWriter = setInterval(() => {
      if (currentIndex < fullText.length) {
        setThoughtText((prev) => fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeWriter);
      }
    }, 50);

    return () => clearInterval(typeWriter);
  }, [isHoveringChatbot]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { user: userMessage, bot: '...' }]);
    setInput('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMessage }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].bot = data.message;
          return updated;
        });
      } else {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].bot = 'Error: Could not get a response';
          return updated;
        });
      }
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].bot = 'Error: Network issue';
        return updated;
      });
    }
  };

  // Theme-based styles
  const themeStyles = {
    container: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
    },
    header: {
      background: theme === 'light' 
        ? 'linear-gradient(45deg, #5750F1, #7B74F7)' 
        : 'linear-gradient(45deg, #2B2A6D, #4A489E)',
      color: '#ffffff',
    },
    messagesArea: {
      backgroundColor: theme === 'light' ? '#f9fafb' : '#374151',
    },
    userMessage: {
      backgroundColor: theme === 'light' ? '#5750F1' : '#4A489E',
      color: '#ffffff',
    },
    botMessage: {
      backgroundColor: theme === 'light' ? '#e5e7eb' : '#4b5563',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
    },
    inputArea: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#1f2937',
      borderTop: `1px solid ${theme === 'light' ? '#e5e7eb' : '#4b5563'}`,
    },
    input: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#2d3748',
      border: `1px solid ${theme === 'light' ? '#d1d5db' : '#4b5563'}`,
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
    },
    button: {
      background: theme === 'light' 
        ? 'linear-gradient(45deg, #5750F1, #7B74F7)' 
        : 'linear-gradient(45deg, #2B2A6D, #4A489E)',
      color: '#ffffff',
    },
    focusRing: theme === 'light' ? 'rgba(87, 80, 241, 0.2)' : 'rgba(74, 72, 158, 0.3)',
    thoughtBubble: {
      backgroundColor: theme === 'light' ? '#ffffff' : '#2d3748',
      color: theme === 'light' ? '#1f2937' : '#e5e7eb',
      boxShadow: `0 4px 15px rgba(0, 0, 0, ${theme === 'light' ? '0.15' : '0.3'})`,
      zIndex: 1001,
    },
  };

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Render nothing if loading or unauthenticated
  if (status === 'loading' || status === 'unauthenticated') {
    return null;
  }

  return (
    <div ref={chatbotRef} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
      <style>{`
        @keyframes floatChat {
          0% { transform: translateY(0px) scale(${isHoveringChatbot ? '1.15' : '1'}); }
          50% { transform: translateY(-8px) scale(${isHoveringChatbot ? '1.15' : '1'}); }
          100% { transform: translateY(0px) scale(${isHoveringChatbot ? '1.15' : '1'}); }
        }
        @keyframes popIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bubbleFadeIn {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>

      {/* Chatbot Button and UI */}
      {!isOpen ? (
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHoveringChatbot(true)}
            onMouseLeave={() => setIsHoveringChatbot(false)}
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
              animation: 'floatChat 3s ease-in-out infinite',
              animationDelay: '0s',
              transition: 'box-shadow 0.3s ease',
            }}
            aria-label="Open chatbot"
          >
            <Image
              src="/images/chatbot/POE-Logo.png"
              alt="Chatbot Logo"
              width={40}
              height={40}
              style={{ objectFit: 'contain' }}
            />
          </button>
          {isHoveringChatbot && thoughtText && (
            <div
              style={{
                ...themeStyles.thoughtBubble,
                position: 'absolute',
                bottom: '80px',
                right: '-10px',
                padding: '12px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                minWidth: '200px',
                whiteSpace: 'nowrap',
                animation: 'bubbleFadeIn 0.3s ease-out',
                opacity: 1,
                transform: 'translateY(0)',
              }}
            >
              <span>{thoughtText}</span>
              {thoughtText.length < 'Hey there, I am your Saathi, do you have any queries?'.length && (
                <span 
                  style={{ 
                    marginLeft: '2px',
                    borderRight: `2px solid ${theme === 'light' ? '#1f2937' : '#e5e7eb'}`,
                    animation: 'blink 1s step-end infinite'
                  }}
                >&nbsp;</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            ...themeStyles.container,
            borderRadius: '20px',
            width: isEnlarged ? '750px' : '320px',
            height: isEnlarged ? '850px' : '450px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: `0 10px 40px rgba(0, 0, 0, ${theme === 'light' ? '0.2' : '0.5'})`,
            transition: 'all 0.3s ease',
            animation: 'popIn 0.4s ease-out',
            zIndex: 1003,
          }}
        >
          <style>
            {`
              @keyframes fadeSlideIn {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
              }
              @keyframes fadeSlideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(30px); opacity: 0; }
              }
            `}
          </style>
          <div
            style={{
              ...themeStyles.header,
              padding: '12px 16px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              boxShadow: `0 2px 10px rgba(0, 0, 0, ${theme === 'light' ? '0.1' : '0.3'})`,
            }}
          >
            <span style={{ fontWeight: '600', fontSize: '16px' }}>Saathi</span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button
                onClick={() => setIsEnlarged(!isEnlarged)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                aria-label={isEnlarged ? 'Reduce chat window' : 'Enlarge chat window'}
              >
                {isEnlarged ? '🗕' : '🗖'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '18px',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>
          <div
            style={{
              ...themeStyles.messagesArea,
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
            }}
          >
            {messages.map((msg, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                {msg.user && (
                  <div style={{ textAlign: 'right', marginBottom: '8px' }}>
                    <span
                      style={{
                        ...themeStyles.userMessage,
                        padding: '10px 14px',
                        borderRadius: '18px',
                        display: 'inline-block',
                        maxWidth: '80%',
                        boxShadow: `0 3px 8px rgba(0, 0, 0, ${theme === 'light' ? '0.1' : '0.3'})`,
                        fontSize: '14px',
                        lineHeight: '1.5',
                      }}
                    >
                      {msg.user}
                    </span>
                  </div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <span
                    style={{
                      ...themeStyles.botMessage,
                      padding: '10px 14px',
                      borderRadius: '18px',
                      display: 'inline-block',
                      maxWidth: '80%',
                      boxShadow: `0 3px 8px rgba(0, 0, 0, ${theme === 'light' ? '0.1' : '0.3'})`,
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}
                  >
                    {msg.bot}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              ...themeStyles.inputArea,
              padding: '12px 16px',
              display: 'flex',
              gap: '12px',
              borderBottomLeftRadius: '20px',
              borderBottomRightRadius: '20px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              style={{
                ...themeStyles.input,
                flex: 1,
                padding: '12px',
                borderRadius: '14px',
                outline: 'none',
                fontSize: '14px',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                boxShadow: `0 2px 5px rgba(0, 0, 0, ${theme === 'light' ? '0.05' : '0.2'})`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme === 'light' ? '#5750F1' : '#4A489E';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${themeStyles.focusRing}`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme === 'light' ? '#d1d5db' : '#4b5563';
                e.currentTarget.style.boxShadow = `0 2px 5px rgba(0, 0, 0, ${theme === 'light' ? '0.05' : '0.2'})`;
              }}
              placeholder="Type a message..."
            />
            <button
              onClick={sendMessage}
              style={{
                ...themeStyles.button,
                border: 'none',
                padding: '12px 20px',
                borderRadius: '14px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                boxShadow: `0 3px 10px ${theme === 'light' ? 'rgba(87, 80, 241, 0.3)' : 'rgba(74, 72, 158, 0.3)'}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = `0 5px 15px ${theme === 'light' ? 'rgba(87, 80, 241, 0.5)' : 'rgba(74, 72, 158, 0.5)'}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = `0 3px 10px ${theme === 'light' ? 'rgba(87, 80, 241, 0.3)' : 'rgba(74, 72, 158, 0.3)'}`;
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;