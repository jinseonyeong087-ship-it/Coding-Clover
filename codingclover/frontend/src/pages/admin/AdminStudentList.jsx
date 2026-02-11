import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "@/components/AdminNav";
import Tail from "@/components/Tail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Search } from "lucide-react";

function AdminStudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // 새로 추가한 학생 전용 API 사용
      const response = await fetch("/admin/users/students", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (response.ok) {
        const students = await response.json();
        setStudents(students.map(student => ({
          studentId: student.userId,
          name: student.name,
          loginId: student.loginId,
          totalEnrollments: student.totalEnrollments || 0,
          lastActiveAt: student.lastActiveAt
        })));
        return;
      }
      
      console.warn("학생 API 실패, enrollment 기반으로 대체");
      
      // 백업: enrollment 조회 (수강 정보 추가)
      const enrollmentResponse = await fetch("/admin/enrollment", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (!enrollmentResponse.ok) {
        setStudents([]);
        return;
      }

      const enrollmentData = await enrollmentResponse.json();
      const enrollmentList = Array.isArray(enrollmentData) ? enrollmentData : [];
      
      // 학생별 수강 정보 집계
      const enrollmentMap = new Map();
      enrollmentList.forEach(enrollment => {
        const studentKey = String(enrollment.userId || enrollment.studentId);
        if (!enrollmentMap.has(studentKey)) {
          enrollmentMap.set(studentKey, {
            count: 0,
            lastActivity: null,
            name: enrollment.userName || enrollment.studentName,
            loginId: enrollment.loginId
          });
        }
        const info = enrollmentMap.get(studentKey);
        info.count += 1;
        
        const activityDate = enrollment.enrolledAt;
        if (activityDate && (!info.lastActivity || new Date(activityDate) > new Date(info.lastActivity))) {
          info.lastActivity = activityDate;
        }
      });
      
      // enrollment 기반 학생 목록 구성
      const fallbackStudents = [];
      enrollmentMap.forEach((info, studentId) => {
        fallbackStudents.push({
          studentId: studentId,
          name: info.name || `학생 ${studentId}`,
          loginId: info.loginId || 'unknown',
          totalEnrollments: info.count,
          lastActiveAt: info.lastActivity
        });
      });
      
      setStudents(fallbackStudents);
    } catch (error) {
      console.error("학생 목록 조회 실패:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const keywordLower = keyword.trim().toLowerCase();
    if (!keywordLower) return students;
    return students.filter((student) => {
      const name = (student.name || "").toLowerCase();
      const loginId = (student.loginId || student.email || "").toLowerCase();
      return name.includes(keywordLower) || loginId.includes(keywordLower);
    });
  }, [students, keyword]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };

  const handleOpenDetail = (student) => {
    const studentId = student.studentId || student.userId || student.id;
    if (!studentId) return;
    navigate(`/admin/students/${studentId}`);
  };

  return (
    <>
      <AdminNav />
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
              학생 관리
            </h1>
            <p className="text-muted-foreground">학생 목록을 조회하고 상세 화면으로 이동합니다.</p>
          </div>
          <Button variant="outline" onClick={fetchStudents}>
            새로고침
          </Button>
        </div>

        <Card className="p-4 mb-6 bg-background/60 backdrop-blur-xl border-border/50">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="학생명 또는 로그인 ID로 검색..."
                className="pl-9"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-center w-[100px]">ID</TableHead>
                <TableHead className="text-center">학생명</TableHead>
                <TableHead className="text-center">로그인 ID</TableHead>
                <TableHead className="text-center w-[140px]">총 수강</TableHead>
                <TableHead className="text-center w-[160px]">최근 활동</TableHead>
                <TableHead className="text-center w-[120px]">상세</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    로딩중...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16 text-muted-foreground">
                    학생 데이터가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow
                    key={student.studentId || student.userId || student.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {student.studentId || student.userId || student.id}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {student.name || "-"}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {student.loginId || student.email || "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {student.totalEnrollments ?? student.enrollmentCount ?? 0}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatDate(student.lastActiveAt)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenDetail(student)}
                      >
                        상세 보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {!loading && filteredStudents.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{students.length}</div>
                <div className="text-sm text-muted-foreground">전체 학생</div>
              </div>
            </Card>
            <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  {students.filter((student) => (student.totalEnrollments ?? 0) > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">수강 경험 있음</div>
              </div>
            </Card>
            <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-500">
                  {students.filter((student) => (student.totalEnrollments ?? 0) === 0).length}
                </div>
                <div className="text-sm text-muted-foreground">수강 경험 없음</div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <Tail />
    </>
  );
}

export default AdminStudentList;
