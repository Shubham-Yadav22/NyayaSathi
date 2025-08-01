"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import CopyButton from "@/components/ui/copybutton";
import ReactMarkdown from "react-markdown";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function LegalChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Legal Assistant. I can help you with legal questions, document guidance, and general legal information. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function formatBotResponse(raw: string): string {
    try {
      // Remove initial "Prompt..." line
      const [, contextAndAnswer] = raw.split("Context:");
      const [rawContext, rawAnswer] = contextAndAnswer.split("Question:");
      const contextLines = rawContext.trim().split(/\n(?=BNS Section:)/);

      const formattedContext = contextLines
        .map((block) => {
          const sectionMatch = block.match(/BNS Section:\s*(.+)/);
          const subjectMatch = block.match(/Subject:\s*(.+)/);
          const content = block
            .replace(/BNS Section:.*\n/, "")
            .replace(/Subject:.*\n/, "")
            .trim();

          const section = sectionMatch ? sectionMatch[1].trim() : "";
          const subject = subjectMatch ? subjectMatch[1].trim() : "";

          return `🔹 **Section ${section}**  \n📌 *${subject}*\n> ${content}`;
        })
        .join("\n\n");

      const finalAnswerMatch =
        rawAnswer.split("Answer:")[1]?.trim() || "⚠️ No answer returned.";

      return `**🧠 Answer:**\n${finalAnswerMatch}\n\n---\n\n**📚 Context:**\n${formattedContext}`;
    } catch (err) {
      console.warn("⚠️ Could not format bot reply:", err);
      return raw;
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await fetch("https://backend-nyasathi-1.onrender.com/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputMessage }),
      })
      

      const data = await response.json();
      console.log("✅ API Response:", data);

      const botResponse: Message = {
        id: messages.length + 2,
        text: formatBotResponse(data.reply),
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("❌ Chatbot Error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          💬 Legal Chatbot Assistant
        </h1>
        <p className="text-muted-foreground">
          Get instant legal guidance and information
        </p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden bg-muted/30">
        <div className="h-full overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl transition-colors ${
                    message.isUser
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card text-card-foreground rounded-bl-md shadow-sm border border-border"
                  }`}
                >
                  
                  {message.isUser ? (
                    <p className="text-sm sm:text-base leading-relaxed">
                      {message.text}
                    </p>
                                      ) : (
                      <div className="relative">
                        <CopyButton text={message.text} />
                        <div className="prose prose-sm sm:prose-base max-w-none">
                          <ReactMarkdown>
                            {message.text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  <p
                    className={`text-xs mt-2 ${
                      message.isUser
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-card text-card-foreground rounded-2xl rounded-bl-md shadow-sm border border-border px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border p-4 sm:p-6">
        <div className="flex space-x-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your legal question here..."
            className="flex-1 rounded-full px-4 py-3 border-input bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
            disabled={isTyping}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-3 flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          This chatbot provides general legal information only. Consult a
          qualified attorney for specific legal advice.
        </p>
      </div>
    </div>
  );
}
