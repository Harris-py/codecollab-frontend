// src/components/Session/ChatWindow.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LoadingSpinner from '../Common/LoadingSpinner';
import { clsx } from 'clsx';
import { format, isToday, isYesterday, differenceInMinutes } from 'date-fns';

const ChatWindow = ({
  sessionId,
  messages = [],
  currentUser,
  participants = [],
  onSendMessage,
  isConnected = false,
  className
}) => {
  const { theme } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [isScrolledUp, setIsScrolledUp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Combine prop messages with local history
  const allMessages = [...messageHistory, ...messages].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );

  // Auto-scroll to bottom
  const scrollToBottom = useCallback((force = false) => {
    if (messagesEndRef.current && (!isScrolledUp || force)) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isScrolledUp]);

  // Handle scroll detection
  const handleScroll = useCallback(() => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 10;
      setIsScrolledUp(!isAtBottom);
      
      if (isAtBottom) {
        setUnreadCount(0);
      }
    }
  }, []);

  // Update message history and scroll
  useEffect(() => {
    if (messages.length > 0) {
      const newMessages = messages.filter(msg => 
        !messageHistory.some(existing => existing.id === msg.id)
      );
      
      if (newMessages.length > 0) {
        setMessageHistory(prev => [...prev, ...newMessages]);
        
        // Update unread count if user is scrolled up
        if (isScrolledUp) {
          setUnreadCount(prev => prev + newMessages.length);
        }
        
        // Auto-scroll for own messages or if at bottom
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.username === currentUser?.username || !isScrolledUp) {
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    }
  }, [messages, messageHistory, currentUser?.username, isScrolledUp, scrollToBottom]);

  // Handle typing indicators
  useEffect(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 3000);
    }
    
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [isTyping]);

  // Handle message submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isConnected) return;
    
    const messageData = {
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    
    onSendMessage?.(messageData.content);
    setNewMessage('');
    setIsTyping(false);
    
    // Focus back to input
    inputRef.current?.focus();
    
    // Scroll to bottom after sending
    setTimeout(() => scrollToBottom(true), 100);
  }, [newMessage, isConnected, onSendMessage, scrollToBottom]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
    }
  }, [isTyping]);

  // Handle Enter key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Format message timestamp
  const formatMessageTime = useCallback((timestamp) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  }, []);

  // Check if messages should be grouped
  const shouldGroupMessage = useCallback((currentMsg, prevMsg) => {
    if (!prevMsg) return false;
    
    const isSameUser = currentMsg.username === prevMsg.username;
    const timeDiff = differenceInMinutes(
      new Date(currentMsg.timestamp), 
      new Date(prevMsg.timestamp)
    );
    
    return isSameUser && timeDiff < 5;
  }, []);

  // Get user color
  const getUserColor = useCallback((username) => {
    const participant = participants.find(p => p.username === username);
    return participant?.color || '#667eea';
  }, [participants]);

  // Get user avatar
  const getUserAvatar = useCallback((username) => {
    return username?.charAt(0).toUpperCase() || 'U';
  }, []);

  // Emoji picker data
  const emojis = ['👍', '👎', '😀', '😂', '😍', '🤔', '👏', '🎉', '🔥', '💯', '❤️', '😢', '😮', '😎', '🤝', '💪'];

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div className={clsx('flex flex-col h-full bg-sidebar border-l border-primary', className)}>
      {/* Chat Header */}
      <div className="px-4 py-3 bg-secondary border-b border-primary">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-medium text-primary">Chat</h3>
            <div className={clsx(
              'w-2 h-2 rounded-full',
              isConnected ? 'bg-success' : 'bg-error'
            )}></div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-secondary">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </span>
            
            {unreadCount > 0 && (
              <div className="px-2 py-1 bg-accent text-white text-xs rounded-full">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 scrollbar-thin"
        onScroll={handleScroll}
      >
        {allMessages.length === 0 ? (
          <div className="text-center text-secondary py-8">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">
              Start the conversation with your team
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {allMessages.map((message, index) => {
              const prevMessage = index > 0 ? allMessages[index - 1] : null;
              const isGrouped = shouldGroupMessage(message, prevMessage);
              const isOwn = message.username === currentUser?.username;
              const userColor = getUserColor(message.username);
              
              return (
                <div key={message.id || index} className="animate-slide-in">
                  {!isGrouped && (
                    <div className="flex items-center space-x-2 mt-4 mb-1">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-medium"
                        style={{ backgroundColor: userColor }}
                      >
                        {getUserAvatar(message.username)}
                      </div>
                      <span className="font-medium text-primary text-sm">
                        {message.username}
                        {isOwn && <span className="text-accent ml-1">(You)</span>}
                      </span>
                      <span className="text-xs text-secondary">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  <div className={clsx(
                    'ml-8 mb-2 group',
                    isGrouped && 'mt-1'
                  )}>
                    <div className={clsx(
                      'inline-block max-w-[85%] px-3 py-2 rounded-lg text-sm break-words',
                      isOwn 
                        ? 'bg-accent text-white ml-auto' 
                        : 'bg-tertiary text-primary'
                    )}>
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap">
                        {message.message || message.content}
                      </div>
                    </div>
                    
                    {/* Message Actions (on hover) */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 mt-1">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEmojiSelect('👍')}
                          className="text-xs text-secondary hover:text-primary transition-colors"
                          title="React with 👍"
                        >
                          👍
                        </button>
                        <button
                          onClick={() => {
                            const messageText = `@${message.username} ${message.message || message.content}`;
                            setNewMessage(prev => prev + (prev ? '\n' : '') + `> ${messageText}\n`);
                            inputRef.current?.focus();
                          }}
                          className="text-xs text-secondary hover:text-primary transition-colors"
                          title="Reply"
                        >
                          ↩️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Typing Indicators */}
            {typingUsers.size > 0 && (
              <div className="flex items-center space-x-2 mt-4 text-secondary">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
                <span className="text-sm">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Scroll to Bottom Button */}
      {isScrolledUp && (
        <div className="absolute bottom-20 right-4">
          <button
            onClick={() => scrollToBottom(true)}
            className="bg-accent text-white p-2 rounded-full shadow-lg hover:bg-accent-secondary transition-colors"
            title="Scroll to bottom"
          >
            ⬇️
            {unreadCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-error text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </div>
            )}
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-primary">
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="p-3 border-b border-primary bg-tertiary">
            <div className="grid grid-cols-8 gap-2">
              {emojis.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => handleEmojiSelect(emoji)}
                  className="text-lg hover:bg-secondary rounded p-1 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-3">
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  isConnected 
                    ? "Type a message... (Enter to send, Shift+Enter for new line)"
                    : "Disconnected - Cannot send messages"
                }
                className="w-full resize-none input pr-20"
                rows={newMessage.split('\n').length}
                maxLength={1000}
                disabled={!isConnected}
              />
              
              {/* Input Actions */}
              <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-secondary hover:text-primary transition-colors"
                  disabled={!isConnected}
                >
                  😀
                </button>
                
                <div className="text-xs text-secondary">
                  {newMessage.length}/1000
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim() || !isConnected}
              className="btn-primary btn-sm px-4 py-2 flex-shrink-0"
            >
              {!isConnected ? (
                <LoadingSpinner size="xs" color="white" />
              ) : (
                '📤'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="px-4 py-2 bg-error/10 border-t border-error text-center">
          <div className="flex items-center justify-center space-x-2 text-error text-sm">
            <LoadingSpinner size="xs" />
            <span>Reconnecting to chat...</span>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Help */}
      <div className="px-4 py-2 border-t border-primary bg-tertiary/50">
        <div className="text-xs text-secondary space-y-1">
          <div className="flex justify-between">
            <span>Enter: Send message</span>
            <span>Shift+Enter: New line</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;