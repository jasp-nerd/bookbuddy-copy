import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { chatAPI } from '../services/api';
import { MessageSquare, Send, Loader, Bot, User } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple Markdown parser without external libraries
const parseMarkdown = (text) => {
  if (!text) return '';
  
  let html = text
    // Escape HTML characters
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/__(.*?)__/g, '<strong class="font-semibold">$1</strong>')
    .replace(/_(.*?)_/g, '<em class="italic">$1</em>')
    
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto my-2"><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Lists
    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4">$1</li>')
    
    // Line breaks
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br>');
  
  // Wrap in paragraph tags
  html = `<p class="mb-2">${html}</p>`;
  
  // Fix list formatting
  html = html.replace(/<p class="mb-2">(<li.*?)<\/p>/g, '<ul class="list-disc list-inside mb-2">$1</ul>');
  html = html.replace(/<\/ul><ul class="list-disc list-inside mb-2">/g, '');
  
  return html;
};

const ChatPage = () => {
  const { currentUser, isAuthenticated } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to chat with BookBuddy');
      return;
    }

    if (!inputMessage.trim()) {
      return;
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessage, currentUser.id);
      
      // Add AI response to chat
      const newAIMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, newAIMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-16 h-16 text-book-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-book-900 mb-2">
          Chat with BookBuddy
        </h2>
        <p className="text-book-600 mb-6">
          Sign in to start chatting with our AI book recommendation assistant
        </p>
        <a
          href="/login"
          className="btn-primary inline-flex items-center space-x-2"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Login to Chat</span>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Bot className="w-8 h-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-book-900">Chat with BookBuddy</h1>
        </div>
        <p className="text-book-600">
          Ask me about books, get recommendations, or discuss your reading journey!
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-sm border border-book-200 h-96 flex flex-col">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 text-book-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-book-900 mb-2">
                Welcome to BookBuddy Chat!
              </h3>
              <p className="text-book-600 mb-4">
                I'm here to help you discover amazing books and answer your reading questions.
              </p>
              <div className="space-y-2 text-sm text-book-500">
                <p>Try asking me:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"Recommend me some fantasy books"</li>
                  <li>"What should I read next?"</li>
                  <li>"Tell me about classic literature"</li>
                  <li>"What are the best books for beginners?"</li>
                </ul>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.type === 'error'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-book-100 text-book-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.type === 'ai' && (
                      <Bot className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    {message.type === 'user' && (
                      <User className="w-4 h-4 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      {message.type === 'ai' ? (
                        <div 
                          className="text-sm prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
                        />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      <p className={`text-xs mt-2 ${
                        message.type === 'user' ? 'text-primary-100' : 'text-book-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-book-100 text-book-900 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">BookBuddy is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-book-200 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about books, recommendations, or anything reading-related..."
              className="flex-1 input-field"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-primary-50 rounded-lg p-6 border border-primary-200">
        <h3 className="font-semibold text-primary-900 mb-3">Chat Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-primary-800">
          <div>
            <p className="font-medium mb-1">Get Recommendations:</p>
            <ul className="space-y-1">
              <li>• "Recommend me some mystery books"</li>
              <li>• "What should I read if I liked Harry Potter?"</li>
              <li>• "Suggest books for beginners"</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Ask Questions:</p>
            <ul className="space-y-1">
              <li>• "What are the benefits of reading?"</li>
              <li>• "How do I develop a reading habit?"</li>
              <li>• "Tell me about classic literature"</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 