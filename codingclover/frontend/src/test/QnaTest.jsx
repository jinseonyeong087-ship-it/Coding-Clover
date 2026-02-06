import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from "@/components/ui/badge";
import {
  Search, MessageCircle, CheckCircle2, HelpCircle,
  Plus, User, BookOpen, AlertCircle, X, MoreHorizontal
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

const QnaTest = () => {
  const [qnaList, setQnaList] = useState([]);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [courseId, setCourseId] = useState('');
  const [user, setUser] = useState(null);
  const [courseList, setCourseList] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'my'

  // 상세 보기 관련 state
  const [selectedQna, setSelectedQna] = useState(null);
  const [answerContent, setAnswerContent] = useState('');
  const [instructorId, setInstructorId] = useState('');

  // 답변 수정 관련 state
  const [editingAnswerId, setEditingAnswerId] = useState(null);
  const [editContent, setEditContent] = useState('');

  // 질문 수정 관련 state
  const [isEditingQna, setIsEditingQna] = useState(false);
  const [editQnaTitle, setEditQnaTitle] = useState('');
  const [editQnaQuestion, setEditQnaQuestion] = useState('');

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  useEffect(() => {
    // 유저 정보 가져오기
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
      setInstructorId(u.userId || u.id); // 기본적으로 내 아이디 셋팅
    }
  }, []);

  const fetchQnaList = async () => {
    try {
      let url = '/student/qna';
      if (viewMode === 'my') {
        if (!user) {
          setQnaList([]);
          return;
        }
        url = `/student/qna/my?userId=${user.userId || user.id}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setQnaList(data);
      } else {
        console.error("Failed fetch qna list");
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [viewMode, user]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/course');
        if (response.ok) {
          const data = await response.json();
          setCourseList(data);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      }
    };
    fetchCourses();
  }, []);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQna || !answerContent || !instructorId) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/instructor/qna/${selectedQna.qnaId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId: Number(instructorId),
          content: answerContent
        })
      });

      if (response.ok) {
        alert("답변이 등록되었습니다!");
        setAnswerContent('');
        // 리스트 갱신 및 상세 정보 갱신 (모달 유지)
        handleQnaClick(selectedQna.qnaId);
        fetchQnaList();
      } else {
        alert("답변 등록 실패");
      }
    } catch (err) {
      console.error(err);
      alert("에러 발생");
    }
  };

  const handleAnswerUpdate = async (answerId) => {
    if (!editContent.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/instructor/qna/answer/${answerId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId || user.id,
          content: editContent
        })
      });

      if (response.ok) {
        alert("답변이 수정되었습니다.");
        setEditingAnswerId(null);
        setEditContent('');
        if (selectedQna) handleQnaClick(selectedQna.qnaId); // 상세 정보 갱신
      } else {
        const msg = await response.text();
        alert("수정 실패: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("에러 발생");
    }
  };

  const handleAnswerDelete = async (answerId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/instructor/qna/answer/${answerId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId || user.id
        })
      });

      if (response.ok) {
        alert("답변이 삭제되었습니다.");
        if (selectedQna) {
          handleQnaClick(selectedQna.qnaId);
          fetchQnaList();
        }
      } else {
        const msg = await response.text();
        alert("삭제 실패: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("에러 발생");
    }
  };

  const handleQnaUpdate = async () => {
    if (!editQnaTitle.trim() || !editQnaQuestion.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch(`/student/qna/${selectedQna.qnaId}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId || user.id,
          title: editQnaTitle,
          question: editQnaQuestion
        })
      });

      if (response.ok) {
        alert("질문이 수정되었습니다.");
        setIsEditingQna(false);
        fetchQnaList();
        handleQnaClick(selectedQna.qnaId);
      } else {
        const msg = await response.text();
        alert("수정 실패: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("에러 발생");
    }
  };

  const handleQnaDelete = async () => {
    if (!window.confirm("정말 이 질문을 삭제하시겠습니까? (관련된 모든 답변도 삭제될 수 있습니다)")) return;

    try {
      const response = await fetch(`/student/qna/${selectedQna.qnaId}/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.userId || user.id
        })
      });

      if (response.ok) {
        alert("질문이 삭제되었습니다.");
        setSelectedQna(null);
        fetchQnaList();
      } else {
        const msg = await response.text();
        alert("삭제 실패: " + msg);
      }
    } catch (err) {
      console.error(err);
      alert("에러 발생");
    }
  };


  const handleQnaClick = async (id) => {
    try {
      const response = await fetch(`/student/qna/${id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedQna(data);
        // 초기화
        setAnswerContent('');
        setIsEditingQna(false);
        setEditQnaTitle(data.title);
        setEditQnaQuestion(data.question);
      } else {
        alert("상세 정보를 불러오는데 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!courseId) {
      alert('강좌 ID를 입력해주세요.');
      return;
    }

    const qnaData = {
      title,
      question,
      userId: user.userId || user.id,
      courseId: Number(courseId)
    };

    try {
      const response = await fetch('/student/qna/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(qnaData),
      });

      if (response.ok) {
        alert('질문이 등록되었습니다.');
        setTitle('');
        setQuestion('');
        setCourseId('');
        setIsWriteModalOpen(false);
        fetchQnaList();
      } else {
        alert('등록 실패');
      }
    } catch (error) {
      console.error('Error submitting QnA:', error);
      alert('에러 발생');
    }
  };

  // Filter Logic
  const getFilteredList = () => {
    let filtered = [...qnaList];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(q =>
        q.title.toLowerCase().includes(lower) ||
        q.question.toLowerCase().includes(lower) ||
        (q.courseTitle && q.courseTitle.toLowerCase().includes(lower))
      );
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };
  const filteredQnaList = getFilteredList();


  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      <Nav />
      <div className="h-16"></div> {/* Spacer */}

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            {/* Write Button */}
            {/* Write Button - Hidden for Admin */}
            {(!user || user.role !== 'ADMIN') && (
              <Button
                onClick={() => {
                  if (!user) return alert("로그인이 필요합니다.");
                  setIsWriteModalOpen(true);
                }}
                className="w-full h-12 text-base font-bold bg-[#5d5feF] hover:bg-[#4b4ddb] shadow-md transition-all"
              >
                <Plus className="mr-2 h-5 w-5" />
                질문하기
              </Button>
            )}

            {/* Filters */}
            <nav className="space-y-1">
              <button
                onClick={() => setViewMode('all')}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${viewMode === 'all' ? 'bg-white text-[#5d5feF] shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4" />
                  전체 질문
                </div>
              </button>

              <button
                onClick={() => {
                  if (!user) return alert('로그인이 필요합니다.');
                  setViewMode('my');
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${viewMode === 'my' ? 'bg-white text-[#5d5feF] shadow-sm ring-1 ring-gray-200' : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4" />
                  내 질문
                </div>
              </button>
            </nav>

            {/* Course Filter Info */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-500">
              <p>원하는 강좌의 질문을 찾고 싶다면 상단 검색창을 이용해보세요.</p>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">QnA 게시판</h1>
                <p className="text-gray-500 text-sm mt-1">
                  {viewMode === 'my' ? '내가 작성한 질문 목록입니다.' : '지식 공유의 장, 서로 묻고 답하며 함께 성장하세요.'}
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 bg-white border-gray-200 focus:ring-[#5d5feF]"
                  placeholder="제목, 내용 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredQnaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                  <HelpCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900">질문이 없습니다</p>
                </div>
              ) : (
                filteredQnaList.map(qna => {
                  const isSolved = qna.status === 'ANSWERED' || (qna.answers && qna.answers.length > 0);
                  const answerCount = qna.answers ? qna.answers.length : 0;

                  return (
                    <div
                      key={qna.qnaId}
                      onClick={() => handleQnaClick(qna.qnaId)}
                      className="group bg-white rounded-xl border border-gray-200 p-6 cursor-pointer hover:border-[#5d5feF] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`mt-1 shrink-0 ${isSolved ? 'text-green-500' : 'text-gray-300'}`}>
                          {isSolved ? <CheckCircle2 className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            {qna.courseTitle && (
                              <Badge variant="secondary" className="bg-gray-100 text-gray-600 font-normal">
                                {qna.courseTitle}
                              </Badge>
                            )}
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${isSolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isSolved ? '해결됨' : '미해결'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5d5feF] transition-colors mb-2 line-clamp-1">
                            {qna.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                            {qna.question}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-400">
                            <span className="font-medium text-gray-600">{qna.userName || '익명'}</span>
                            <div className="w-px h-3 bg-gray-200"></div>
                            <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right Side Answer Count */}
                        <div className="hidden sm:block self-center min-w-[3.5rem] text-center">
                          <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl border ${isSolved ? 'bg-green-50 border-green-100 text-green-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                            <span className="text-xl font-bold leading-none">{answerCount}</span>
                            <span className="text-[10px] mt-1">답변</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Write Modal */}
      <Dialog open={isWriteModalOpen} onOpenChange={setIsWriteModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>새로운 질문 작성</DialogTitle>
            <DialogDescription>궁금한 점을 자세히 적어주세요.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseId">강좌 선택</Label>
              <select
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">강좌를 선택해주세요</option>
                {courseList.map((course) => (
                  <option key={course.courseId} value={course.courseId}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="제목을 입력하세요" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question">내용</Label>
              <textarea
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={question} onChange={(e) => setQuestion(e.target.value)} required placeholder="내용을 입력하세요"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsWriteModalOpen(false)}>취소</Button>
              <Button type="submit" className="bg-[#5d5feF]">등록하기</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal */}
      {selectedQna && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-start bg-white shrink-0">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{selectedQna.courseTitle || '강좌 미정'}</Badge>
                  <span className="text-xs text-gray-400">{new Date(selectedQna.createdAt).toLocaleString()}</span>
                </div>
                {isEditingQna ? (
                  <Input value={editQnaTitle} onChange={(e) => setEditQnaTitle(e.target.value)} className="text-xl font-bold mb-2" />
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedQna.title}</h2>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{selectedQna.userName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isEditingQna && user && ((user.userId || user.id) === selectedQna.userId || user.role === 'ADMIN') && (
                  <div className="flex gap-2 mr-2">
                    {(user.userId || user.id) === selectedQna.userId && (
                      <Button variant="outline" size="sm" onClick={() => {
                        setIsEditingQna(true);
                        setEditQnaTitle(selectedQna.title);
                        setEditQnaQuestion(selectedQna.question);
                      }}>수정</Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={handleQnaDelete}>삭제</Button>
                  </div>
                )}
                <Button variant="ghost" size="icon" onClick={() => setSelectedQna(null)}>
                  <X className="h-6 w-6 text-gray-500" />
                </Button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#F8F9FA]">
              {/* Question Content */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
                {isEditingQna ? (
                  <div className="space-y-4">
                    <textarea
                      className="flex min-h-[200px] w-full rounded-md border border-input px-3 py-2 text-sm"
                      value={editQnaQuestion} onChange={(e) => setEditQnaQuestion(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditingQna(false)}>취소</Button>
                      <Button onClick={handleQnaUpdate}>저장 완료</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {selectedQna.question}
                  </div>
                )}
              </div>

              {/* Answers */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                  <MessageCircle className="h-5 w-5 text-[#5d5feF]" />
                  답변 {selectedQna.answers ? selectedQna.answers.length : 0}개
                </h3>

                {selectedQna.answers && selectedQna.answers.length > 0 ? (
                  selectedQna.answers.map(ans => {
                    const isAnsOwner = user && (user.userId || user.id) === ans.instructorId;
                    return (
                      <div key={ans.answerId} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#5d5feF]"></div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#5d5feF]/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-[#5d5feF]" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">{ans.instructorName}</span>
                                <Badge variant="secondary" className="bg-[#5d5feF] text-white hover:bg-[#4b4ddb] text-[10px] h-5">강사</Badge>
                              </div>
                              <span className="text-xs text-gray-400">{new Date(ans.answeredAt).toLocaleString()}</span>
                            </div>
                          </div>
                          {((user && (user.userId || user.id) === ans.instructorId) || (user && user.role === 'ADMIN')) && editingAnswerId !== ans.answerId && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isAnsOwner && <Button variant="ghost" size="xs" className="h-7 text-xs" onClick={() => {
                                setEditingAnswerId(ans.answerId);
                                setEditContent(ans.content);
                              }}>수정</Button>}
                              <Button variant="ghost" size="xs" className="h-7 text-xs text-red-500 hover:text-red-700" onClick={() => handleAnswerDelete(ans.answerId)}>삭제</Button>
                            </div>
                          )}
                        </div>

                        {editingAnswerId === ans.answerId ? (
                          <div className="space-y-2">
                            <textarea className="w-full border rounded p-2 text-sm" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" onClick={() => setEditingAnswerId(null)}>취소</Button>
                              <Button size="sm" onClick={() => handleAnswerUpdate(ans.answerId)}>저장</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-800 whitespace-pre-wrap leading-relaxed pl-11">
                            {ans.content}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-400 bg-white rounded-xl border border-dashed">
                    <p>아직 등록된 답변이 없습니다.</p>
                  </div>
                )}
              </div>

              {/* Answer Form */}
              {user && user.role === 'INSTRUCTOR' && (
                <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-md">
                  <h3 className="font-bold text-gray-900 mb-4">답변 작성하기</h3>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="강사 ID (디버그용/실제론 자동할당 권장)"
                      value={instructorId}
                      onChange={e => setInstructorId(e.target.value)}
                      className="mb-2 hidden" // Hide if not needed visually
                    />
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-gray-50 px-3 py-2 text-sm focus:bg-white transition-colors"
                      placeholder="답변 내용을 입력하세요..."
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAnswerSubmit} className="bg-[#5d5feF]">답변 등록</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default QnaTest;
