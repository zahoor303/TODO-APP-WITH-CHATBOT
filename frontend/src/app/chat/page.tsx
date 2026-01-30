"use client";

import { useState, useRef, useEffect } from "react";
import { getStoredJwt } from '@/services/authService'; // Import the function to get stored JWT

// Define types for our messages
interface Message {
  role: string;
  content: string;
  type?: string;
  tasks?: any[];
}

// Since we're only supporting English, we don't need dynamic locale
export default function ChatPage() {
  const locale = 'en'; // Hardcode to English
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      // Get the JWT token using the same method as FloatingChatWidget
      const jwt = getStoredJwt();
      console.log("JWT Token:", jwt); // Debug log

      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      // Add Authorization header if JWT token exists
      if (jwt) {
        headers["Authorization"] = `Bearer ${jwt}`;
        console.log('Authorization header added');
      } else {
        console.log("No JWT token found"); // Debug log
      }

      let API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
      // Replace 0.0.0.0 with localhost for browser requests
      if (API_BASE_URL.includes('0.0.0.0')) {
        API_BASE_URL = API_BASE_URL.replace('0.0.0.0', 'localhost');
      }

      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ message: input, locale: locale }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.tasks) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: data.response, type: "tasks", tasks: data.tasks },
        ]);
      } else {
        setMessages([...newMessages, { role: "assistant", content: data.response }]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message to chat
      setMessages([...newMessages, {
        role: "assistant",
        content: "Sorry, there was an error processing your request. Please make sure the backend server is running."
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-indigo-900/10 to-black">
      <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-gray-900/20 to-gray-900/50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`message-bubble p-4 max-w-lg ${
                msg.role === "user" ? "message-bubble.user" : "message-bubble.assistant"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.type === "tasks" && msg.tasks && Array.isArray(msg.tasks) && (
                <div className="mt-3 space-y-2">
                  <div className="text-sm font-medium border-t border-gray-600/30 pt-2 mt-2 text-gray-300">
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
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
            <div className="mb-6 p-4 bg-indigo-500/10 rounded-full">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-400">
                <path d="M8 12H16M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Welcome to AI Assistant</h3>
            <p className="text-gray-400 max-w-md">Ask me about your tasks, productivity tips, or anything else you need help with.</p>
          </div>
        )}
      </div>
      <div className="p-4 bg-gray-800/50 backdrop-blur-sm border-t border-gray-700/50">
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="input-field w-full px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Type your message..."
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-1">
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
                  isListening ? "bg-red-500 text-white" : "text-gray-400 hover:text-white hover:bg-gray-700"
                } transition-colors`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 17C14.7614 17 17 14.7614 17 12V6C17 3.23858 14.7614 1 12 1C9.23858 1 7 3.23858 7 6V12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M6 21V19C6 17.3431 7.34315 16 9 16H15C16.6569 16 18 17.3431 18 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={`btn btn-primary px-6 py-3 rounded-xl font-medium transition-all ${
              !input.trim() ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="inline mr-2">
              <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}