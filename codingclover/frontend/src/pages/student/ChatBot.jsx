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

function ChatBot() {

  const [chatHistory, setChatHistory] = useState([]); // 채팅 내역 (배열)
  const [input, setInput] = useState(''); // 입력창 텍스트 (문자열)

  // 사용자가 보낸 message 내용에 맞는 답변을 fetch로 받아오는 함수
  const handleSend = async () => {
    if (!input.trim()) return; // trim=공백 메시지 방지
    setChatHistory(prev => [...prev, { type: 'user', content: input }]); // 사용자 질문을 화면에 추가
    setInput(''); // 입력창 초기화
    
    try {
      await fetch(`/ask?message=${encodeURIComponent(input)}`, { method: 'GET' })
      if (!response.ok) throw new Error(`서버 에러: ${response.status}`);
      const data = await response.json();//ai답변을 가져옴
      setChatHistory(prev => [...prev, { role: 'bot', content: data.message }]); // ai답변을 화면에 추가

    } catch (error) {
      throw new Error(`HTTP 에러 발생! 상태코드: ${response.status}`);
      setChatHistory(prev => [...prev, { role: 'bot', content: "새로고침 후 다시 시도해 주세요." }]);
    } finally {
      setInput(''); // 입력창 초기화
    }
  }
  return (
    <>
      <Popover className="fixed bottom-4 right-4">{/* 여기 className은 컴포넌트 뻈을 떄?? 사용 */}
        <HoverCard>
          <HoverCardTrigger><PopoverTrigger asChild>질문💭</PopoverTrigger></HoverCardTrigger>
          <HoverCardContent className="flex w-64 flex-col gap-0.5" side="left">
            <h4>코딩하다가 막히면<br></br>여기에 물어보세요!</h4>
          </HoverCardContent>
        </HoverCard>

        <PopoverContent className="sm:max-w-[425px] " side="top">
          <PopoverHeader className="flex flex-col items-center justify-between">
            <>
              <PopoverTitle><h2>코딩 어시스턴트</h2></PopoverTitle>
            </>
            <div className="flex h-2 w-20 items-center justify-center gap-2">
              <Button className="data-[state=open]:animate-in">➕</Button>
              <Button className="data-[side=bottom]:slide-in-from-top-2">➖</Button>
              <Button className="data-[state=closed]:animate-out">✖</Button>
            </div>
          </PopoverHeader>
          <PopoverDescription>
            <ScrollArea>
              {message.map((msg, i) => <div key={i}>{msg.content}</div>)}
            </ScrollArea>
            <Textarea value={message} onChange={(e) => { setMessage(e.target.value) }} placeholder="챗봇에게 물어보세요">
              <Button onClick={handleSend}>전송⬆</Button>
            </Textarea>
          </PopoverDescription>
        </PopoverContent>
      </Popover >
    </>

  );
}

export default ChatBot;