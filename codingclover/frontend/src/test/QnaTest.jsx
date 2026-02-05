import React, { useState, useEffect } from 'react';
import Nav from '@/components/Nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';


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
        setSelectedQna(null); // 모달 닫기
        fetchQnaList(); // 리스트 갱신
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
          // 상태 업데이트를 위해 다시 불러오거나 리스트 갱신
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
        // 리스트 및 상세 갱신
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
        fetchQnaList(); // 리스트 갱신
      } else {
        alert('등록 실패');
      }
    } catch (error) {
      console.error('Error submitting QnA:', error);
      alert('에러 발생');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Nav />
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">QnA 테스트 페이지</h1>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">
              {user ? `${user.name}(${user.role})님` : '비로그인'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('users');
                localStorage.removeItem('token'); // if used
                window.location.reload();
              }}
            >
              로그아웃/세션초기화
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QnA 등록 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>질문 등록하기</CardTitle>
              <CardDescription>새로운 질문을 등록해봅니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (Existing form fields: courseId, title, question) ... */}
                <div>
                  <Label htmlFor="courseId">강좌 선택</Label>
                  <select
                    id="courseId"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">강좌를 선택해주세요</option>
                    {courseList.map((course) => (
                      <option key={course.courseId} value={course.courseId}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="질문 제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="question">내용</Label>
                  <textarea
                    id="question"
                    placeholder="질문 내용"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button type="submit" className="w-full">질문 등록</Button>
              </form>
            </CardContent>
          </Card>

          {/* QnA 리스트 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>질문 목록</CardTitle>
                <CardDescription>
                  질문을 클릭하면 상세 내용을 확인하고 답변을 달 수 있습니다.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('all')}
                >
                  전체 보기
                </Button>
                <Button
                  variant={viewMode === 'my' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('my')}
                >
                  내 질문만
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {qnaList.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    {viewMode === 'my' && !user ? '로그인이 필요합니다.' : '등록된 질문이 없습니다.'}
                  </p>
                ) : (
                  qnaList.map((qna) => (
                    <div
                      key={qna.qnaId}
                      className="p-4 border rounded-lg hover:bg-slate-50 relative group cursor-pointer transition-colors"
                      onClick={() => handleQnaClick(qna.qnaId)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{qna.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${qna.status === 'ANSWERED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {qna.status || 'WAIT'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {qna.question}
                      </p>
                      <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-foreground">
                            {qna.userName || 'User'}
                          </span>
                        </div>
                        <span>{new Date(qna.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 상세 보기 모달 */}
      {selectedQna && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background animate-in fade-in zoom-in duration-200">
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  {isEditingQna ? (
                    <div className="flex gap-2 items-center mb-2">
                      <Input
                        value={editQnaTitle}
                        onChange={(e) => setEditQnaTitle(e.target.value)}
                        className="text-lg font-bold"
                      />
                    </div>
                  ) : (
                    <CardTitle className="text-xl">{selectedQna.title}</CardTitle>
                  )}
                  <CardDescription className="mt-1 flex gap-2">
                    <span>작성자: {selectedQna.userName}</span>
                    <span>•</span>
                    <span>{new Date(selectedQna.createdAt).toLocaleString()}</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {!isEditingQna && user && (
                    <>
                      {(user.userId || user.id) === selectedQna.userId && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            setIsEditingQna(true);
                            setEditQnaTitle(selectedQna.title);
                            setEditQnaQuestion(selectedQna.question);
                          }}
                        >
                          수정
                        </Button>
                      )}
                      {((user.userId || user.id) === selectedQna.userId || user.role === 'ADMIN') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 text-xs"
                          onClick={handleQnaDelete}
                        >
                          삭제
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setSelectedQna(null)}>✕</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {console.log("Selected QnA Debug:", selectedQna)}
              <div>
                <h3 className="font-semibold mb-2">질문 내용</h3>
                {isEditingQna ? (
                  <div className="space-y-4">
                    <textarea
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={editQnaQuestion}
                      onChange={(e) => setEditQnaQuestion(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditingQna(false)}>취소</Button>
                      <Button onClick={handleQnaUpdate}>저장</Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-md min-h-[100px] whitespace-pre-wrap border">
                    {selectedQna.question || "질문 내용이 없습니다."}
                  </div>
                )}
              </div>

              {/* 답변 리스트 표시 */}
              {selectedQna.answers && selectedQna.answers.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4 text-green-700">등록된 답변</h3>
                  <div className="space-y-4">
                    {selectedQna.answers.map((ans) => {
                      const isOwner = user && (user.userId || user.id) === ans.instructorId;
                      const isAdmin = user && user.role === 'ADMIN';

                      return (
                        <div key={ans.answerId} className="bg-green-50 p-4 rounded-md border border-green-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{ans.instructorName || '강사'}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground mr-2">{new Date(ans.answeredAt).toLocaleString()}</span>
                              {editingAnswerId !== ans.answerId && (
                                <div className="flex gap-1">
                                  {isOwner && (
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      className="h-7 px-2 text-xs text-blue-600 hover:text-blue-800"
                                      onClick={() => {
                                        setEditingAnswerId(ans.answerId);
                                        setEditContent(ans.content);
                                      }}
                                    >
                                      수정
                                    </Button>
                                  )}
                                  {(isOwner || isAdmin) && (
                                    <Button
                                      variant="ghost"
                                      size="xs"
                                      className="h-7 px-2 text-xs text-red-600 hover:text-red-800"
                                      onClick={() => handleAnswerDelete(ans.answerId)}
                                    >
                                      삭제
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {editingAnswerId === ans.answerId ? (
                            <div className="space-y-2">
                              <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                              />
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => setEditingAnswerId(null)}>취소</Button>
                                <Button size="sm" onClick={() => handleAnswerUpdate(ans.answerId)}>저장</Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{ans.content}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 답변 작성 폼 (강사 권한일 때만 표시) */}
              <div className="border-t pt-6">
                <div className="mb-4 bg-yellow-50 p-2 text-xs text-yellow-800 rounded">
                  DEBUG: 현재 로그인 Role: {user ? JSON.stringify(user.role) : '없음'} / ID: {user ? (user.userId || user.id) : '없음'}
                </div>
              </div>
              {user && user.role === 'INSTRUCTOR' && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-4">답변 작성 (강사 전용)</h3>
                  <form onSubmit={handleAnswerSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="modalInstructorId">강사 ID (User ID)</Label>
                      <Input
                        id="modalInstructorId"
                        type="number"
                        value={instructorId}
                        onChange={(e) => setInstructorId(e.target.value)}
                        placeholder="강사 ID 입력"
                        className="mb-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="modalAnswerContent">답변 내용</Label>
                      <textarea
                        id="modalAnswerContent"
                        className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        placeholder="답변 내용을 입력하세요..."
                        value={answerContent}
                        onChange={(e) => setAnswerContent(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setSelectedQna(null)}>취소</Button>
                      <Button type="submit">답변 등록</Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card >
        </div >
      )}
    </div >
  );
};

export default QnaTest;
