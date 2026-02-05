import React, { useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

function ChatBot({ className }) {

  const [chatHistory, setChatHistory] = useState([]); // 채팅 내역 (배열)
  const [input, setInput] = useState(''); // 입력창 텍스트 (문자열)

  // UI 상태 관리 추가
  const [isOpen, setIsOpen] = useState(false); // Popover 열림/닫힘 상태
  const [isMaximized, setIsMaximized] = useState(false); // 최대화 여부

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
    setChatHistory(prev => [...prev, { role: 'user', content: input }]); // 사용자 질문을 화면에 추가
    setInput(''); // 입력창 초기화
    
    try {
      const response = await fetch(`/ask?message=${encodeURIComponent(input)}`, { method: 'GET' })
      if (response.ok) console.log("서버 응답 성공");
      if (!response.ok) console.log(`서버 에러: ${response.status}`);
      const data = await response.json();//ai답변을 가져옴
      setChatHistory(prev => [...prev, { role: 'bot', content: data.message }]); // ai답변을 화면에 추가

    } catch (error) {
      console.error('Fetch 에러:', error);
      setChatHistory(prev => [...prev, { role: 'bot', content: "새로고침 후 다시 시도해 주세요." }]);
    } finally {
      setInput(''); // 입력창 초기화
    }
  }

  // catch에서 throw new Error사용하면 다음 코드를 실행하지 않고 중단
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <HoverCard>
          <HoverCardTrigger asChild><PopoverTrigger className="bg-blue-500 text-white rounded-full w-12 h-12 flex items-center justify-center">💭</PopoverTrigger></HoverCardTrigger>
          <HoverCardContent className="flex w-64 flex-col gap-0.5" side="left">
            <h4>코딩하다가 막히면<br></br>여기에 물어보세요!</h4>
          </HoverCardContent>
        </HoverCard>

        <PopoverContent className="sm:max-w-[425px] " side="top" align="end">
          <PopoverHeader className="flex flex-col items-center justify-between">
            <>
              <PopoverTitle><h2>코딩 어시스턴트</h2></PopoverTitle>
            </>
            <div className="flex h-2 w-20 items-center justify-center gap-2">
              <button onClick={handleMax}>➕</button>
              <button onClick={handleMin} >➖</button>
              <button onClick={handleClose}>✖</button>
            </div>
          </PopoverHeader>
          <PopoverDescription>
            <ScrollArea>
              {chatHistory.map((msg, i) => <div key={i}>{msg.content}</div>)}
            </ScrollArea>
            <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="어시스턴트에게 물어보세요" />
            <Button onClick={handleSend}>전송⬆</Button>
          </PopoverDescription>
        </PopoverContent>
      </Popover >
    </div>

  );
}

export default ChatBot;