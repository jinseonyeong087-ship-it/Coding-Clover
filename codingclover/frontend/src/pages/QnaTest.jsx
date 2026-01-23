import React, { useState, useEffect } from 'react';
import StudentNav from '@/components/StudentNav';
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

  useEffect(() => {
    // 유저 정보 가져오기
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    fetchQnaList();
  }, []);

  const fetchQnaList = async () => {
    try {
      const response = await fetch('/student/qna');
      if (response.ok) {
        const data = await response.json();
        setQnaList(data);
      }
    } catch (error) {
      console.error('Failed to fetch QnA list:', error);
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
      userId: user.userId, // Users 엔티티의 ID 필드명이 userId라고 가정 (확인 필요시 체크)
      courseId: Number(courseId)
    };
    // 주의: 백엔드 QnaController에서 userId 변수명이 정확히 무엇인지 확인 필요. 
    // QnaController.java를 보면 @RequestBody QnaAddRequest request를 받음.
    // QnaAddRequest에는 private Long userId; 라고 되어있음.
    // 하지만 프론트 localStorage에 저장된 user 객체의 id 속성명이 'userId'인지 'id'인지 확인 필요.
    // 보통 DB 컬럼이 user_id이면 JPA entity는 userId, JSON 변환시는 userId일 가능성 높음. 
    // 혹은 ResponseDto에 따라 다름. 안전하게 확인하자.
    // -> MainLogin.jsx에서 response.json()을 저장함.
    // 만약 Users 객체 자체라면 @Id private Long userId; 일 것임.

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
    <div className="min-h-screen flex flex-col bg-background">
      <StudentNav />
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-8">QnA 테스트 페이지</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* QnA 등록 폼 */}
          <Card>
            <CardHeader>
              <CardTitle>질문 등록하기</CardTitle>
              <CardDescription>새로운 질문을 등록해봅니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="courseId">강좌 ID (숫자)</Label>
                  <Input
                    id="courseId"
                    type="number"
                    placeholder="예: 1"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">테스트용이라 강좌 ID를 직접 입력해야 합니다.</p>
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
                <Button type="submit" className="w-full">등록</Button>
              </form>
            </CardContent>
          </Card>

          {/* QnA 리스트 */}
          <Card>
            <CardHeader>
              <CardTitle>질문 목록</CardTitle>
              <CardDescription>전체 질문 리스트입니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {qnaList.length === 0 ? (
                  <p className="text-center text-muted-foreground">등록된 질문이 없습니다.</p>
                ) : (
                  qnaList.map((qna) => (
                    <div key={qna.qnaId} className="p-4 border rounded-lg hover:bg-slate-50">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{qna.title}</h3>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          {qna.status || 'STATUS'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {qna.question}
                      </p>
                      <div className="flex justify-end text-xs text-muted-foreground">
                        <span>작성자: {qna.users?.name || qna.users?.username || 'User'}</span>
                        <span className="mx-2">|</span>
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
    </div>
  );
};

export default QnaTest;
