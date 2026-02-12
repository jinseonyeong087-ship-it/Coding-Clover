import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
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
import { Search, RefreshCw, UserCheck, GraduationCap } from "lucide-react";

function AdminStudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      setLoading(true);
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
      <Nav />
      {/* Background neutralized per user feedback */}
      <div className="min-h-screen bg-gray-50 pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

          <AdminSidebar />

          <main className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  학생 관리
                </h1>
                <p className="text-gray-500">학생 목록을 조회하고 상세 정보를 관리합니다.</p>
              </div>
              <Button
                variant="outline"
                onClick={fetchStudents}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
            </div>

            {/* Quick Stats Summary */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{students.length}</div>
                    <div className="text-xs text-gray-500 font-medium">전체 학생</div>
                  </div>
                </Card>
                <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {students.filter((student) => (student.totalEnrollments ?? 0) > 0).length}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">수강 경험 있음</div>
                  </div>
                </Card>
                <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {students.filter((student) => (student.totalEnrollments ?? 0) === 0).length}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">수강 경험 없음</div>
                  </div>
                </Card>
              </div>
            )}

            <Card className="p-3 mb-6 bg-white border-gray-200 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="학생명 또는 로그인 ID로 검색..."
                  className="pl-10 h-11 border-transparent focus:ring-0 bg-gray-50/50"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                />
              </div>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-50 border-b border-gray-100">
                  <TableRow>
                    <TableHead className="text-center w-[100px] text-gray-600 font-bold">ID</TableHead>
                    <TableHead className="text-center text-gray-600 font-bold">학생명</TableHead>
                    <TableHead className="text-center text-gray-600 font-bold">로그인 ID</TableHead>
                    <TableHead className="text-center w-[140px] text-gray-600 font-bold">총 수강</TableHead>
                    <TableHead className="text-center w-[160px] text-gray-600 font-bold">최근 활동</TableHead>
                    <TableHead className="text-center w-[120px] text-gray-600 font-bold">관리</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                        데이터를 불러오는 중입니다...
                      </TableCell>
                    </TableRow>
                  ) : filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow
                        key={student.studentId || student.userId || student.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="text-center font-mono text-xs text-gray-400">
                          {student.studentId || student.userId || student.id}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-900">
                          {student.name || "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {student.loginId || student.email || "-"}
                        </TableCell>
                        <TableCell className="text-center text-gray-900 font-bold">
                          {student.totalEnrollments ?? student.enrollmentCount ?? 0}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {formatDate(student.lastActiveAt)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetail(student)}
                            className="bg-white border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 h-8 px-3 rounded-lg text-xs"
                          >
                            상세 정보
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </main>
        </div>
      </div>

      <Tail />
    </>
  );
}

export default AdminStudentList;
