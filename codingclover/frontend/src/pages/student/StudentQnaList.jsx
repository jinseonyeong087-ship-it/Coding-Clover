import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Badge } from "@/components/ui/badge";
import {
  Search, MessageCircle, CheckCircle2, HelpCircle,
  Plus, User, BookOpen, AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentQnaList = () => {
  const navigate = useNavigate();
  const [qnaList, setQnaList] = useState([]);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [courseId, setCourseId] = useState('');
  const [user, setUser] = useState(null);
  const [courseList, setCourseList] = useState([]); // Enrolled courses
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'my'

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  useEffect(() => {
    // 유저 정보 가져오기
    const storedUser = localStorage.getItem('users');
    if (storedUser) {
      const u = JSON.parse(storedUser);
      setUser(u);
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

      const response = await axios.get(url);
      setQnaList(response.data);
    } catch (e) {
      console.error("Failed fetch qna list", e);
    }
  };

  useEffect(() => {
    fetchQnaList();
  }, [viewMode, user]);

  // Fetch enrolled courses for the dropdown
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        // Use the endpoint that returns enrolled courses for the logged-in student
        const response = await axios.get('/student/enrollment', { withCredentials: true });
        setCourseList(response.data);
      } catch (err) {
        console.error("Failed to fetch enrolled courses", err);
      }
    };
    if (user) {
      fetchEnrolledCourses();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!courseId) {
      alert('강좌를 선택해주세요.');
      return;
    }

    const qnaData = {
      title,
      question,
      userId: user.userId || user.id,
      courseId: Number(courseId)
    };

    try {
      const response = await axios.post('/student/qna/add', qnaData);

      if (response.status === 200) {
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
      <div className="h-16"></div>

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
                      onClick={() => navigate(`/student/qna/${qna.qnaId}`)}
                      className="group relative bg-background/60 backdrop-blur-md rounded-xl border border-border/50 p-6 cursor-pointer hover:bg-background/80 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-6 bottom-6 w-1 rounded-r-full transition-colors ${isSolved ? 'bg-green-500' : 'bg-orange-400'}`} />

                      <div className="flex items-start gap-5 pl-3">
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
                <option value="">강좌를 선택해주세요 (수강 중인 강좌만 표시됩니다)</option>
                {courseList.length === 0 && <option disabled>수강 중인 강좌가 없습니다.</option>}
                {courseList.map((course) => (
                  <option key={course.courseId} value={course.courseId}>{course.courseTitle}</option>
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
      <Tail />
    </div>
  );
};

export default StudentQnaList;
