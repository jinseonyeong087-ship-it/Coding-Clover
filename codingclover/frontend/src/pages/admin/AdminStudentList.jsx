import React, { useEffect, useState, useCallback } from "react";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis
} from "@/components/ui/pagination";
import { Search, RefreshCw, UserCheck, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";

function AdminStudentList() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // 통계 카드 상태 (백엔드에서 전체 학생 수 불러오기)
  const [totalStudents, setTotalStudents] = useState(0);
  const [withEnrollment, setWithEnrollment] = useState(0);
  const [withoutEnrollment, setWithoutEnrollment] = useState(0);

  const fetchStudents = useCallback(async (page = 0, searchKeyword = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set("page", page);
      if (searchKeyword.trim()) {
        params.set("keyword", searchKeyword.trim());
      }

      const response = await fetch(`/admin/users/students?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.students.map(student => ({
          studentId: student.userId,
          name: student.name,
          loginId: student.loginId,
          totalEnrollments: student.totalEnrollments || 0,
          lastActiveAt: student.lastActiveAt
        })));
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);

        // 통계 카드 데이터 (백엔드에서 전체 학생 수 계산)
        setTotalStudents(data.totalStudents);
        setWithEnrollment(data.withEnrollment);
        setWithoutEnrollment(data.withoutEnrollment);
        return;
      }

      setStudents([]);
    } catch (error) {
      console.error("학생 목록 조회 실패:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // 검색어 변경 시 디바운스 (500ms 후 서버 요청)
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(0);
      fetchStudents(0, keyword);
    }, 500);
    return () => clearTimeout(timer);
  }, [keyword, fetchStudents]);

  // 페이지 변경
  const handlePageChange = (page) => {
    if (page < 0 || page >= totalPages) return;
    setCurrentPage(page);
    fetchStudents(page, keyword);
  };

  // 페이지 번호 목록 생성 (현재 페이지 기준 최대 5개)
  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, start + 4);
    start = Math.max(0, end - 4);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

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
    navigate(`/admin/users/students/${studentId}`);
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-white pt-20 pb-20">
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
                onClick={() => fetchStudents(currentPage, keyword)}
                className="bg-white border-gray-200 hover:bg-gray-50"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                새로고침
              </Button>
            </div>

            {/* 통계 카드 (백엔드에서 전체 학생 수 불러오기) */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{totalStudents}</div>
                    <div className="text-xs text-gray-500 font-medium">전체 학생</div>
                  </div>
                </Card>
                <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{withEnrollment}</div>
                    <div className="text-xs text-gray-500 font-medium">수강 경험 있음</div>
                  </div>
                </Card>
                <Card className="p-5 bg-white border-gray-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{withoutEnrollment}</div>
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
                    <TableHead className="text-center w-[100px] text-gray-600 font-bold">번호</TableHead>
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
                  ) : students.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-gray-400">
                        검색 결과가 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    students.map((student, index) => {
                      // 1번부터 역순으로 번호 계산 (페이지당 10개씩 표시)
                      const pageSize = 10;
                      const sequenceNumber = totalElements - (currentPage * pageSize) - index;
                      
                      return (
                      <TableRow
                        key={student.studentId || student.userId || student.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <TableCell className="text-center font-mono text-xs text-gray-600 font-medium">
                          {sequenceNumber}
                        </TableCell>
                        <TableCell className="text-center font-medium text-gray-900">
                          {student.name || "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
                          {student.loginId || student.email || "-"}
                        </TableCell>
                        <TableCell className="text-center text-sm text-gray-500">
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
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>

            {/* 페이지네이션: 이전 <- 1, 2, 3, 4 -> 다음 */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {getPageNumbers()[0] > 0 && (
                      <>
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(0)} className="cursor-pointer">
                            1
                          </PaginationLink>
                        </PaginationItem>
                        {getPageNumbers()[0] > 1 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                      </>
                    )}

                    {getPageNumbers().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          isActive={page === currentPage}
                          onClick={() => handlePageChange(page)}
                          className="cursor-pointer"
                        >
                          {page + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                      <>
                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink onClick={() => handlePageChange(totalPages - 1)} className="cursor-pointer">
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>

      <Tail />
    </>
  );
}

export default AdminStudentList;
