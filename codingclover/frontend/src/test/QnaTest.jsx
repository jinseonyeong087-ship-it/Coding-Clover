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
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <Nav />
      {/* Spacer for fixed nav */}
      <div className="h-4"></div>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-0">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Write Button */}
            {(!user || user.role !== 'ADMIN') && (
              <Button
                onClick={() => {
                  if (!user) return alert("로그인이 필요합니다.");
                  setIsWriteModalOpen(true);
                }}
                className="w-full h-14 text-base font-bold shadow-lg bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-all rounded-xl"
              >
                <Plus className="mr-2 h-5 w-5" />
                새 질문 작성하기
              </Button>
            )}

            {/* Filter Menu */}
            <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-xl p-2 shadow-sm">
              <nav className="space-y-1">
                <button
                  onClick={() => setViewMode('all')}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${viewMode === 'all'
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />
                    전체 질문
                  </div>
                  {viewMode === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>

                <button
                  onClick={() => {
                    if (!user) return alert('로그인이 필요합니다.');
                    setViewMode('my');
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all ${viewMode === 'my'
                      ? 'bg-primary/10 text-primary shadow-sm'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4" />
                    내 질문
                  </div>
                  {viewMode === 'my' && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </button>
              </nav>
            </div>

            {/* Helper Card */}
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 p-6 rounded-xl border border-purple-500/20 shadow-sm">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                도움말
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                궁금한 내용이 있다면 주저하지 말고 질문해보세요. 강사님과 다른 학생들이 답변해드립니다.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <section className="flex-1 min-w-0">
            <div className="mb-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-end">
              <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">QnA 게시판</h1>
                <p className="text-muted-foreground">
                  {viewMode === 'my' ? '내가 작성한 질문들의 목록입니다.' : '함께 배우고 성장하는 지식 공유의 공간입니다.'}
                </p>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:bg-background transition-all"
                  placeholder="제목, 내용으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="space-y-4">
              {filteredQnaList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-background/40 rounded-2xl border border-dashed border-border/50">
                  <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                    <HelpCircle className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-foreground">등록된 질문이 없습니다</p>
                  <p className="text-sm text-muted-foreground mt-1">첫 번째 질문의 주인공이 되어보세요!</p>
                </div>
              ) : (
                filteredQnaList.map(qna => {
                  const isSolved = qna.status === 'ANSWERED' || (qna.answers && qna.answers.length > 0);
                  const answerCount = qna.answers ? qna.answers.length : 0;

                  return (
                    <div
                      key={qna.qnaId}
                      onClick={() => handleQnaClick(qna.qnaId)}
                      className="group relative bg-background/60 backdrop-blur-md rounded-xl border border-border/50 p-6 cursor-pointer hover:bg-background/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${isSolved ? 'bg-green-500' : 'bg-orange-400'}`} />

                      <div className="flex items-start gap-5 pl-3">
                        {/* Solved Status Icon */}
                        {/* <div className={`mt-1 shrink-0 ${isSolved ? 'text-green-500' : 'text-orange-400'}`}>
                          {isSolved ? <CheckCircle2 className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
                        </div> */}

                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {qna.courseTitle && (
                              <Badge variant="outline" className="bg-muted/50 text-muted-foreground font-normal border-border/50">
                                {qna.courseTitle}
                              </Badge>
                            )}
                            <Badge variant={isSolved ? "default" : "secondary"} className={`${isSolved ? "bg-green-500 hover:bg-green-600" : "bg-orange-400/10 text-orange-500 hover:bg-orange-400/20"}`}>
                              {isSolved ? <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />해결됨</span> : "답변 대기"}
                            </Badge>
                          </div>

                          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1 pr-4">
                            {qna.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                            {qna.question}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1 font-medium text-foreground/80">
                              <User className="h-3 w-3" />
                              {qna.userName || '익명'}
                            </span>
                            <div className="w-px h-3 bg-border"></div>
                            <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Right Side Answer Count */}
                        <div className="hidden sm:flex flex-col items-center justify-center min-w-[4rem] self-center">
                          <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl border transition-colors ${answerCount > 0
                              ? 'bg-primary/10 border-primary/20 text-primary'
                              : 'bg-muted/30 border-border/50 text-muted-foreground'
                            }`}>
                            <span className="text-lg font-bold leading-none">{answerCount}</span>
                            <MessageCircle className="h-3 w-3 mt-1" />
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
        <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">새로운 질문 작성</DialogTitle>
            <DialogDescription>
              궁금한 점을 자세히 적어주세요. 상세한 질문은 더 좋은 답변을 받습니다.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="courseId" className="font-semibold">강좌 선택</Label>
              <select
                id="courseId"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                required
                className="flex h-11 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">강좌를 선택해주세요</option>
                {courseList.map((course) => (
                  <option key={course.courseId} value={course.courseId}>{course.title}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title" className="font-semibold">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="핵심 내용을 요약해주세요"
                className="h-11 bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="question" className="font-semibold">내용</Label>
              <textarea
                className="flex min-h-[200px] w-full rounded-md border border-input bg-background/50 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none leading-relaxed"
                value={question} onChange={(e) => setQuestion(e.target.value)} required placeholder="질문 내용을 자세히 입력해주세요. 코드나 에러 메시지를 포함하면 좋습니다."
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsWriteModalOpen(false)}>취소</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">등록하기</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Modal Overlay */}
      {selectedQna && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-background shadow-2xl border-border/50 ring-1 ring-border/50">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/50 flex justify-between items-start bg-muted/20 shrink-0">
              <div className="flex-1 min-w-0 mr-8">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-background">{selectedQna.courseTitle || '강좌 미정'}</Badge>
                  <span className="text-xs text-muted-foreground">{new Date(selectedQna.createdAt).toLocaleString()}</span>
                </div>

                {isEditingQna ? (
                  <Input
                    value={editQnaTitle}
                    onChange={(e) => setEditQnaTitle(e.target.value)}
                    className="text-xl font-bold mb-2 h-12"
                  />
                ) : (
                  <h2 className="text-2xl font-bold text-foreground leading-snug">{selectedQna.title}</h2>
                )}

                <div className="flex items-center gap-2 mt-3 text-sm">
                  <span className="text-muted-foreground">작성자:</span>
                  <span className="font-medium text-foreground flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {selectedQna.userName}
                  </span>
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
                <Button variant="ghost" size="icon" onClick={() => setSelectedQna(null)} className="rounded-full hover:bg-muted">
                  <X className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted">
              {/* Question Content */}
              <div className="bg-muted/30 rounded-xl border border-border/50 p-6 mb-8">
                {isEditingQna ? (
                  <div className="space-y-4">
                    <textarea
                      className="flex min-h-[300px] w-full rounded-md border border-input bg-background p-4 text-base leading-relaxed"
                      value={editQnaQuestion} onChange={(e) => setEditQnaQuestion(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setIsEditingQna(false)}>취소</Button>
                      <Button onClick={handleQnaUpdate}>저장 완료</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-foreground whitespace-pre-wrap leading-relaxed text-base min-h-[100px]">
                    {selectedQna.question}
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50 my-8" />

              {/* Answers */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  답변 <span className="text-primary">{selectedQna.answers ? selectedQna.answers.length : 0}</span>
                </h3>

                {selectedQna.answers && selectedQna.answers.length > 0 ? (
                  <div className="space-y-6">
                    {selectedQna.answers.map(ans => {
                      const isAnsOwner = user && (user.userId || user.id) === ans.instructorId;
                      return (
                        <div key={ans.answerId} className="flex gap-4">
                          {/* Avatar */}
                          <div className="shrink-0">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold">
                              {/* <User className="h-5 w-5" /> */}
                              {ans.instructorName.charAt(0)}
                            </div>
                          </div>

                          {/* Content Bubble */}
                          <div className="flex-1 min-w-0">
                            <div className="bg-muted/10 rounded-2xl rounded-tl-none border border-border/50 p-5 hover:bg-muted/20 transition-colors group">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-foreground">{ans.instructorName}</span>
                                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 text-[10px] px-1.5 h-5">강사</Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground mt-1 block">{new Date(ans.answeredAt).toLocaleString()}</span>
                                </div>

                                {((user && (user.userId || user.id) === ans.instructorId) || (user && user.role === 'ADMIN')) && editingAnswerId !== ans.answerId && (
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isAnsOwner && <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => {
                                      setEditingAnswerId(ans.answerId);
                                      setEditContent(ans.content);
                                    }}>수정</Button>}
                                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleAnswerDelete(ans.answerId)}>삭제</Button>
                                  </div>
                                )}
                              </div>

                              {editingAnswerId === ans.answerId ? (
                                <div className="space-y-2 mt-2">
                                  <textarea
                                    className="w-full border border-input rounded-md p-3 text-sm bg-background"
                                    rows={4}
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                  />
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setEditingAnswerId(null)}>취소</Button>
                                    <Button size="sm" onClick={() => handleAnswerUpdate(ans.answerId)}>저장</Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                                  {ans.content}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-border/50">
                    <p className="mb-2">아직 등록된 답변이 없습니다.</p>
                    <p className="text-sm">조금만 기다려주시면 강사님이 답변을 등록해드립니다.</p>
                  </div>
                )}
              </div>

              {/* Answer Form */}
              {user && user.role === 'INSTRUCTOR' && (
                <div className="mt-8 bg-primary/5 rounded-xl border border-primary/20 p-6">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    답변 작성하기
                  </h3>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="강사 ID"
                      value={instructorId}
                      onChange={e => setInstructorId(e.target.value)}
                      className="mb-2 hidden"
                    />
                    <textarea
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background/50 px-4 py-3 text-sm focus:bg-background transition-colors placeholder:text-muted-foreground"
                      placeholder="수강생에게 도움이 될 답변을 작성해주세요."
                      value={answerContent}
                      onChange={(e) => setAnswerContent(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <Button onClick={handleAnswerSubmit} className="bg-primary hover:bg-primary/90 shadow-md">답변 등록</Button>
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
