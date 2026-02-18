import React, { useState, useRef, useEffect } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Maximize2, Minimize2, X, Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

function ChatBot({ className }) {

  const [chatHistory, setChatHistory] = useState([]); // 채팅 내역 (배열)
  const [input, setInput] = useState(''); // 입력창 텍스트 (문자열)
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태

  // UI 상태 관리 추가
  const [isOpen, setIsOpen] = useState(false); // Popover 열림/닫힘 상태
  const [isMaximized, setIsMaximized] = useState(false); // 최대화 여부
  const scrollRef = useRef(null);

  // 채팅 내역 변경 시 스크롤 하단으로 이동
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatHistory]);

  // 1. handleMax: 기본 크기 <-> 최대 크기 토글
  const handleMax = () => {
    setIsMaximized(!isMaximized);
  };

  // 2. handleMin: 질문 내역은 유지하되 창만 닫음 (Popover를 닫음)
  const handleMin = () => {
    setIsOpen(false);
  };

  // 3. handleClose: 창을 닫고 질문 내역 초기화
  const handleClose = () => {
    if (window.confirm("채팅을 종료하시겠습니까? 내역이 삭제됩니다.")) {
      setChatHistory([]);
      setIsOpen(false);
      setIsMaximized(false);
    }
  };

  // 사용자가 보낸 message 내용에 맞는 답변을 fetch로 받아오는 함수
  const handleSend = async () => {
    if (!input.trim()) return; // trim=공백 메시지 방지
    const userMessage = input;
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]); // 사용자 질문을 화면에 추가
    setInput(''); // 입력창 초기화
    setIsLoading(true);

    try {
      const response = await fetch(`/ask?message=${encodeURIComponent(userMessage)}`, { method: 'GET' })
      if (response.ok) console.log("서버 응답 성공");
      if (!response.ok) console.log(`서버 에러: ${response.status}`);
      const data = await response.json();//ai답변을 가져옴
      setChatHistory(prev => [...prev, { role: 'bot', content: data.message }]); // ai답변을 화면에 추가

    } catch (error) {
      console.error('Fetch 에러:', error);
      setChatHistory(prev => [...prev, { role: 'bot', content: "새로고침 후 다시 시도해 주세요." }]);
    } finally {
      setInput(''); // 입력창 초기화
      setIsLoading(false);
    }
  }

  // catch에서 throw new Error사용하면 다음 코드를 실행하지 않고 중단
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3">
          {!isOpen && (
            <div className="bg-white border border-gray-200 rounded-xl shadow-md px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
              코딩하다가 막히면 물어보세요!
            </div>
          )}
          <PopoverTrigger className="bg-primary hover:bg-primary/90 text-white rounded-full w-16 h-16 text-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200">
            <MessageCircle className="w-7 h-7" />
          </PopoverTrigger>
        </div>

        <PopoverContent
          className={`${isMaximized ? "w-[90vw] h-[80vh] max-w-none" : "w-[440px] h-[580px]"} border border-gray-200 rounded-xl shadow-lg p-0 flex flex-col`}
          side="top"
          align="end"
        >
          {/* Header */}
          <PopoverHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50/50 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-lg flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <PopoverTitle className="text-base font-bold text-gray-900">코딩 어시스턴트</PopoverTitle>
            </div>
            <div className="flex items-center justify-end gap-1">
              <button onClick={handleMax} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors" title={isMaximized ? "기본 크기" : "최대화"}>
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button onClick={handleMin} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 text-gray-500 transition-colors" title="최소화">
                <Minimize2 className="w-4 h-4" />
              </button>
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors" title="종료">
                <X className="w-4 h-4" />
              </button>
            </div>
          </PopoverHeader>

          {/* Chat Area */}
          <PopoverDescription className="flex flex-col flex-1 min-h-0 p-0">
            <ScrollArea ref={scrollRef} className={`flex-1 px-4 py-4 ${isMaximized ? "h-[calc(80vh-140px)]" : "h-[420px]"}`}>
              {chatHistory.length === 0 ? (
                <div className={`flex flex-col items-center justify-center text-center ${isMaximized ? "h-[calc(80vh-140px)]" : "h-[420px]"}`}>
                  <div className="w-14 h-14 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">무엇이든 물어보세요</p>
                  <p className="text-xs text-gray-400">코딩 관련 질문에 답변해 드립니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'bot' && (
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-7 h-7 text-primary" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-primary text-white rounded-2xl rounded-br-md'
                        : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md border border-gray-200'
                        }`}>
                        {msg.role === 'user' ? (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : (
                          <div className="markdown-content">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline && match ? (
                                    <SyntaxHighlighter
                                      {...props}
                                      style={vscDarkPlus}
                                      language={match[1]}
                                      PreTag="div"
                                      className="rounded-lg my-2 !text-xs"
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code {...props} className="bg-gray-200 text-gray-800 rounded px-1.5 py-0.5 text-xs font-mono">
                                      {children}
                                    </code>
                                  )
                                }
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-7 h-7 text-gray-500" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-7 h-7 rounded-lgflex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-7 h-7 text-primary" />
                      </div>
                      <div className="bg-gray-100 border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="px-4 py-3 border-t border-gray-200 bg-white rounded-b-xl">
              <div className="flex gap-2 items-end">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 min-h-[42px] max-h-[120px] resize-none bg-gray-50 border-gray-200 focus:bg-white focus:border-primary/30 rounded-xl text-sm transition-colors"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="h-[42px] px-4 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-none font-bold"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </PopoverDescription>
        </PopoverContent>
      </Popover>
    </div>

  );
}

export default ChatBot;