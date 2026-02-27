"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { AdvisorMessage } from "@/types";
import { sanitizeContentHTML } from "@/lib/sanitize";

interface AIAdvisorProps {
  projectId: string;
  ideaName: string;
}

const SUGGESTED_PROMPTS = [
  "Walk me through registering my LLC",
  "Help me write a cold email to a coworking space",
  "What permits do I need?",
  "How should I price my product?",
  "Help me prepare for my first sales call",
];

export default function AIAdvisor({ projectId, ideaName }: AIAdvisorProps) {
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [maxMessages, setMaxMessages] = useState(20);
  const [limitReached, setLimitReached] = useState(false);
  const [hasUnlimitedAccess, setHasUnlimitedAccess] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load previous messages on mount
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const response = await fetch(`/api/chat-advisor?projectId=${projectId}`);
        const data = await response.json();

        if (data.success) {
          setMessages(data.data.messages || []);
          setMessageCount(data.data.messageCount || 0);
          setMaxMessages(data.data.maxMessages || 20);
          setHasUnlimitedAccess(data.data.hasUnlimitedAccess || false);
          setLimitReached(data.data.limitReached || false);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setIsInitialLoading(false);
      }
    };

    loadMessages();
  }, [projectId]);

  // Handle sending a message
  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading || isStreaming || limitReached) return;

    const userMessage: AdvisorMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: messageText.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          message: messageText.trim(),
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.limitReached) {
          setLimitReached(true);
          setMessageCount(errorData.messageCount);
          setHasUnlimitedAccess(errorData.hasUnlimitedAccess || false);
          // Remove the user message we just added since it wasn't sent
          setMessages((prev) => prev.slice(0, -1));
          return;
        }
        throw new Error(errorData.error || "Failed to send message");
      }

      setIsLoading(false);
      setIsStreaming(true);

      // Create placeholder for assistant message
      const assistantMessage: AdvisorMessage = {
        id: `temp-assistant-${Date.now()}`,
        role: "assistant",
        content: "",
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Read the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.error) {
                throw new Error(data.error);
              }

              if (data.text) {
                fullContent += data.text;
                // Update the last message with new content
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage.role === "assistant") {
                    lastMessage.content = fullContent;
                  }
                  return newMessages;
                });
              }

              if (data.done) {
                setMessageCount(data.messageCount);
                setHasUnlimitedAccess(data.hasUnlimitedAccess || false);
                // Only set limit reached if not unlimited
                if (!data.hasUnlimitedAccess) {
                  setLimitReached(data.messageCount >= data.maxMessages);
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      // Remove the last user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt);
  };

  // Format message content with basic markdown
  const formatMessage = (content: string) => {
    // Convert **bold** to <strong>
    let formatted = content.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    // Convert numbered lists
    formatted = formatted.replace(/^(\d+)\.\s/gm, "<span class='text-spark'>$1.</span> ");
    // Convert bullet points
    formatted = formatted.replace(/^[-•]\s/gm, "<span class='text-spark'>•</span> ");
    // Convert line breaks
    formatted = formatted.replace(/\n/g, "<br />");
    return formatted;
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 rounded-full border-4 border-charcoal-light border-t-spark animate-spin mb-4" />
        <p className="text-warmwhite-muted">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-300px)] min-h-[500px] max-h-[700px]">
      {/* Header with message count */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-warmwhite/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-spark/20 to-accent/20 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-spark"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-warmwhite font-medium text-sm">SparkLocal Advisor</h3>
            <p className="text-warmwhite-dim text-xs">
              Your AI business consultant for {ideaName}
            </p>
          </div>
        </div>
        <div className="text-right">
          {hasUnlimitedAccess ? (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-400">
              Unlimited messages
            </span>
          ) : (
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                limitReached
                  ? "bg-red-500/20 text-red-400"
                  : messageCount > maxMessages * 0.8
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-spark/10 text-spark"
              }`}
            >
              {messageCount} of {maxMessages} messages
            </span>
          )}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-spark/20 to-accent/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-spark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <h3 className="font-display text-xl font-bold text-warmwhite mb-2">
              Ask me anything about your business
            </h3>
            <p className="text-warmwhite-muted text-sm max-w-md mb-6">
              I know everything about your {ideaName} plan — your market research, financial
              projections, local resources, and launch checklist. Ask me for help with
              implementation.
            </p>

            {/* Suggested prompts */}
            <div className="w-full max-w-lg">
              <p className="text-warmwhite-dim text-xs uppercase tracking-wider mb-3">
                Try asking:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    disabled={isLoading || isStreaming || limitReached}
                    className="px-3 py-2 bg-charcoal-light hover:bg-charcoal-light/80 rounded-lg text-sm text-warmwhite-muted hover:text-warmwhite transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-spark text-charcoal-dark rounded-br-md"
                  : "bg-charcoal-light text-warmwhite rounded-bl-md"
              }`}
            >
              {message.role === "assistant" ? (
                <div
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: sanitizeContentHTML(formatMessage(message.content)) }}
                />
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-charcoal-light rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-warmwhite-muted rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-warmwhite-muted rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-warmwhite-muted rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && !limitReached && (
        <div className="mx-4 mb-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Limit reached upgrade prompt */}
      {limitReached && (
        <div className="mx-4 mb-2 p-6 bg-gradient-to-br from-charcoal-light to-charcoal rounded-xl border border-spark/20">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-spark/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-spark"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                />
              </svg>
            </div>
            <h3 className="font-display text-lg font-bold text-warmwhite mb-2">
              You&apos;ve reached your message limit
            </h3>
            <p className="text-warmwhite-muted text-sm mb-4 max-w-sm mx-auto">
              Your conversation is saved and you can review it anytime. Upgrade to a subscription
              for unlimited advisor access across all your projects.
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-spark to-accent text-charcoal-dark font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              Upgrade to Spark Plan — $14.99/month
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </a>
          </div>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-warmwhite/10">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                limitReached
                  ? "Upgrade for unlimited messages"
                  : "Ask about your business plan..."
              }
              disabled={isLoading || isStreaming || limitReached}
              rows={1}
              className="w-full px-4 py-3 bg-charcoal-light rounded-xl text-warmwhite placeholder-warmwhite-dim text-sm resize-none focus:outline-none focus:ring-2 focus:ring-spark/50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isStreaming || limitReached}
            className="px-4 py-3 bg-spark hover:bg-spark-light text-charcoal-dark rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading || isStreaming ? (
              <div className="w-5 h-5 border-2 border-charcoal-dark/20 border-t-charcoal-dark rounded-full animate-spin" />
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>
        {!limitReached && (
          <p className="text-warmwhite-dim text-xs mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        )}
      </form>
    </div>
  );
}
