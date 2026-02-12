import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, User, MessageCircle, MoreHorizontal,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const InstructorQnaDetail = () => {
  const { qnaId } = useParams();
  const navigate = useNavigate();
  const [qna, setQna] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchQnaDetail();
  }, [qnaId]);

  const fetchQnaDetail = async () => {
    try {
      const res = await fetch(`/student/qna/${qnaId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setQna(data);
    } catch (err) {
      console.error("Failed to fetch QnA Detail:", err);
      alert("질문을 불러오는데 실패했습니다.");
      navigate('/instructor/qna');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!answerContent.trim()) return alert("답변 내용을 입력해주세요.");
    try {
      const res = await fetch(`/instructor/qna/${qnaId}/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          instructorId: currentUser.userId || currentUser.id,
          content: answerContent
        })
      });
      if (!res.ok) throw new Error('답변 등록 실패');
      alert("답변이 등록되었습니다.");
      setAnswerContent('');
      fetchQnaDetail();
    } catch (err) {
      alert("답변 등록 실패: " + err.message);
    }
  };

  const handleAnswerUpdate = async (answerId) => {
    if (!editContent.trim()) return alert("답변 내용을 입력해주세요.");
    try {
      const res = await fetch(`/instructor/qna/answer/${answerId}/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser.userId || currentUser.id,
          content: editContent
        })
      });
      if (!res.ok) throw new Error('수정 실패');
      alert("답변이 수정되었습니다.");
      setEditingAnswerId(null);
      setEditContent('');
      fetchQnaDetail();
    } catch (err) {
      alert("답변 수정 실패: " + err.message);
    }
  };

  const handleAnswerDelete = async (answerId) => {
    if (!window.confirm("정말 이 답변을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/instructor/qna/answer/${answerId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: currentUser.userId || currentUser.id
        })
      });
      if (!res.ok) throw new Error('삭제 실패');
      alert("답변이 삭제되었습니다.");
      fetchQnaDetail();
    } catch (err) {
      alert("답변 삭제 실패: " + err.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center">로딩 중...</div>;
  if (!qna) return <div className="min-h-screen bg-white flex items-center justify-center">질문을 찾을 수 없습니다.</div>;

  const isSolved = qna.status === 'ANSWERED' || (qna.answers && qna.answers.length > 0);
  const myUserId = currentUser ? (currentUser.userId || currentUser.id) : null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Nav />
      <div className="h-16"></div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-[#5d5feF]" onClick={() => navigate('/instructor/qna')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          목록으로 돌아가기
        </Button>

        {/* Header Section */}
        <div className="bg-white rounded-t-2xl border border-gray-200 p-8 pb-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="outline" className="text-gray-500 border-gray-300 font-normal">
              {qna.courseTitle || '일반 질문'}
            </Badge>
            <Badge className={`${isSolved ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} border-0`}>
              {isSolved ? '해결됨' : '미해결'}
            </Badge>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {qna.title}
          </h1>

          <div className="flex items-center justify-between border-t border-gray-100 pt-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">{qna.userName}</span>
                  <span className="text-xs text-gray-500">수강생</span>
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200 mx-2"></div>
              <div className="text-sm text-gray-500">
                {new Date(qna.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Question Body */}
        <div className="bg-white rounded-b-2xl border-x border-b border-gray-200 p-8 pt-6 mb-8 text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[200px]">
          {qna.question}
        </div>

        {/* Answers Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle className="h-5 w-5 text-[#5d5feF]" />
            <h2 className="text-xl font-bold text-gray-900">
              {qna.answers ? qna.answers.length : 0}개의 답변
            </h2>
          </div>

          {qna.answers && qna.answers.length > 0 ? (
            qna.answers.map((answer) => {
              const isMyAnswer = myUserId && answer.instructorId === myUserId;

              return (
                <div key={answer.answerId} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#5d5feF]"></div>

                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#5d5feF]/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#5d5feF]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{answer.instructorName}</span>
                          <Badge variant="secondary" className="bg-[#5d5feF] text-white hover:bg-[#4b4ddb] text-[10px] h-5">
                            강사
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(answer.answeredAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {isMyAnswer && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="cursor-pointer" onClick={() => {
                            setEditingAnswerId(answer.answerId);
                            setEditContent(answer.content);
                          }}>
                            수정하기
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={() => handleAnswerDelete(answer.answerId)}>
                            삭제하기
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  {editingAnswerId === answer.answerId ? (
                    <div className="pl-13 space-y-4">
                      <Textarea
                        className="min-h-[120px] bg-gray-50 focus:bg-white transition-colors"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => { setEditingAnswerId(null); setEditContent(''); }}>
                          취소
                        </Button>
                        <Button className="bg-[#5d5feF] hover:bg-[#4b4ddb]" onClick={() => handleAnswerUpdate(answer.answerId)}>
                          수정 완료
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-13 text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {answer.content}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
              <AlertCircle className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">아직 등록된 답변이 없습니다.</p>
              <p className="text-sm text-gray-400">아래에서 답변을 작성해주세요!</p>
            </div>
          )}

          {/* Answer Form */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8 shadow-md">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-[#5d5feF] rounded-full"></span>
              답변 작성하기
            </h3>
            <Textarea
              placeholder="질문에 대한 명쾌한 답변을 남겨주세요."
              className="min-h-[150px] mb-4 bg-gray-50 focus:bg-white transition-colors"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
            />
            <div className="flex justify-end">
              <Button className="bg-[#5d5feF] hover:bg-[#4b4ddb]" onClick={handleAnswerSubmit}>
                답변 등록 완료
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Tail />
    </div>
  );
};

export default InstructorQnaDetail;
