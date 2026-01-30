'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStoredJwt } from '@/services/authService'; // Import the function to get stored JWT

interface Message {
  role: string;
  content: string;
  type?: string;
  tasks?: any[];
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const locale = 'en'; // Hardcode to English

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
    // Replace 0.0.0.0 with localhost for browser requests
    if (API_BASE_URL.includes('0.0.0.0')) {
      API_BASE_URL = API_BASE_URL.replace('0.0.0.0', 'localhost');
    }

    const headers: HeadersInit = { "Content-Type": "application/json" };
    const jwt = getStoredJwt();
    console.log("JWT Token:", jwt); // Debug log
    if (jwt) {
      headers["Authorization"] = `Bearer ${jwt}`;
    } else {
      console.log("No JWT token found"); // Debug log
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: input, locale: locale }),
      });

      console.log("Response status:", response.status); // Debug log
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.tasks) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.response, type: 'tasks', tasks: data.tasks },
        ]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      setMessages([...newMessages, {
        role: 'assistant',
        content: "Sorry, there was an error processing your request. Please make sure the backend server is running."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Widget Toggle Button */}
      <motion.button
        className="w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 12H16M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </motion.button>

      {/* Chat Widget Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-16 right-0 w-[400] max-w-xs sm:max-w-sm md:max-w-md h-[500px] flex flex-col bg-gray-800/90 backdrop-blur-xl rounded-2xl border border-gray-700/50 overflow-hidden shadow-2xl"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-white/30"></div>
                  <h3 className="font-semibold">AI Assistant</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-900/20 to-gray-900/50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                  <div className="mb-4 p-3 bg-indigo-500/10 rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
                      <path d="M8 12H16M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="font-medium text-lg mb-2 text-white">How can I help you today?</h4>
                  <p className="text-sm max-w-xs">Ask me about your tasks, to-do lists, or productivity tips.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        className={`message-bubble px-4 py-3 max-w-[80%] ${
                          msg.role === 'user' ? 'message-bubble.user' : 'message-bubble.assistant'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                        {msg.type === 'tasks' && msg.tasks && Array.isArray(msg.tasks) && (
                          <div className="mt-3 space-y-2">
                            <div className="text-sm font-medium border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                              Tasks:
                            </div>
                            {msg.tasks.map((task, taskIndex) => (
                              <div
                                key={taskIndex}
                                className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/50 text-sm"
                              >
                                <div className="font-medium text-white">{task.title}</div>
                                {task.description && <div className="text-gray-300 mt-1">{task.description}</div>}
                                <div className="text-xs text-gray-400 mt-1">ID: {task.id}</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="message-bubble.assistant px-4 py-3 max-w-[80%]">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                          <span>Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="input-field w-full px-4 py-3 pr-12 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 max-h-32"
                    rows={1}
                    style={{ minHeight: '44px' }}
                  />
                  <div className="absolute right-2 bottom-2 flex space-x-1">
                    <button
                      onClick={() => {
                        if (recognitionRef.current) {
                          if (isListening) {
                            recognitionRef.current.stop();
                            setIsListening(false);
                          } else {
                            recognitionRef.current.start();
                            setIsListening(true);
                          }
                        }
                      }}
                      className={`p-1.5 rounded-full ${
                        isListening
                          ? 'bg-red-500 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700'
                      } transition-colors`}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 17C14.7614 17 17 14.7614 17 12V6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6V12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2"/>
                        <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        <path d="M6 21V19C6 17.3431 7.34315 16 9 16H15C16.6569 16 18 17.3431 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <motion.button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className={`btn btn-primary p-3 rounded-full flex items-center justify-center ${
                    !input.trim() || isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  whileHover={!isLoading && input.trim() ? { scale: 1.05 } : {}}
                  whileTap={!isLoading && input.trim() ? { scale: 0.95 } : {}}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}