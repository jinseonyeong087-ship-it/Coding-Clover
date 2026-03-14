import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

function AdminStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [lectureProgress, setLectureProgress] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("enrollments");  const [statusFilter, setStatusFilter] = useState("ALL");  const [reasonByRequest, setReasonByRequest] = useState({});
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeStatus = (status) => {
    if (status === "CANCELLED" || status === "CANCEL_REQUESTED") return "CANCELED";
    return status;
  };

  const statusLabel = (status) => {
    switch (status) {
      case "ENROLLED":
        return "수강중";
      case "COMPLETED":
        return "수강완료";
      case "CANCEL_REQUESTED":
        return "취소요청";
      case "CANCELED":
        return "취소";
      default:
        return status || "-";
    }
  };

  // 진도율 기반으로 실제 상태 결정
  const getEnrollmentActualStatus = (enrollment) => {
    const normalizedStatus = normalizeStatus(enrollment.status);
    
    // 진도율 맵 생성
    const progressMap = {};
    lectureProgress.forEach(progress => {
      progressMap[progress.courseId] = progress.progressRate || 0;
    });
    
    // 진도율 100%인 강좌는 완료로 분류
    if (normalizedStatus === 'ENROLLED') {
      const progressRate = progressMap[enrollment.courseId] || 0;
      if (progressRate === 100) {
        return 'COMPLETED';
      }
    }
    
    return normalizedStatus;
  };

  // 필터링된 enrollments 계산
  const filteredEnrollments = useMemo(() => {
    if (statusFilter === "ALL") return enrollments;
    return enrollments.filter(enrollment => {
      const actualStatus = getEnrollmentActualStatus(enrollment);
      return actualStatus === statusFilter;
    });
  }, [enrollments, statusFilter, lectureProgress]);

  const statusBadgeClass = (status) => {
    switch (status) {
      case "ENROLLED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "COMPLETED":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      case "CANCEL_REQUESTED":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "CANCELED":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });
  };


  const fetchStudentData = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      // 새로 추가한 학생 상세 정보 API 사용
      const response = await fetch(`/admin/users/students/${studentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (response.ok) {
        const studentDetail = await response.json();

        // summary 정보 設정
        setSummary({
          name: studentDetail.name,
          loginId: studentDetail.loginId,
          joinDate: studentDetail.joinDate,
          role: studentDetail.role || 'STUDENT',
          totalEnrollments: studentDetail.totalEnrollments || 0,
          canceledCount: studentDetail.canceledCount || 0,
          lastActiveAt: studentDetail.lastActiveAt
        });

        console.log("✅ 새로운 학생 상세 API 성공");
      } else {
        // 백업: 기존 enrollment 기반 방식
        console.warn("학생 상세 API 실패, enrollment 기반으로 대체");
        await fetchFallbackStudentData();
      }

      // enrollment 목록 조회
      await fetchEnrollments();

      // 취소 요청 목록 조회
      await fetchCancelRequests();
    } catch (error) {
      console.error("학생 정보 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFallbackStudentData = async () => {
    try {
      // 1차: 해당 학생의 수강내역 조회 (기본)
      const enrollmentResponse = await fetch('/admin/enrollment', {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      let studentEnrollments = [];
      let userInfo = null;

      if (enrollmentResponse.ok) {
        const allEnrollments = await enrollmentResponse.json();
        const enrollmentList = Array.isArray(allEnrollments) ? allEnrollments : [];

        // 해당 학생의 수강내역만 필터링
        studentEnrollments = enrollmentList.filter(enrollment => {
          const enrollmentStudentId = String(enrollment.userId || enrollment.studentId);
          return enrollmentStudentId === String(studentId);
        });

        // enrollment에서 학생 정보 추출
        if (studentEnrollments.length > 0) {
          const firstEnrollment = studentEnrollments[0];
          userInfo = {
            name: firstEnrollment.userName || firstEnrollment.studentName || firstEnrollment.name,
            loginId: firstEnrollment.loginId || firstEnrollment.userName || 'unknown',
            joinDate: null,
            role: 'STUDENT'
          };
        }
      }

      // 2차: 일반 사용자 API 시도
      try {
        const userInfoResponse = await fetch(`/admin/users/${studentId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        });

        if (userInfoResponse.ok) {
          const userData = await userInfoResponse.json();
          userInfo = {
            name: userData.name || userData.userName || (userInfo ? userInfo.name : 'Unknown'),
            loginId: userData.loginId || userData.email || (userInfo ? userInfo.loginId : 'unknown'),
            joinDate: userData.createdAt,
            role: userData.role || userData.userRole || 'STUDENT'
          };
        }
      } catch (error) {
        console.warn("사용자 정보 조회 실패:", error);
      }

      // 기본 정보가 전혀 없다면 임시값 설정
      if (!userInfo) {
        userInfo = {
          name: `학생 ${studentId}`,
          loginId: 'unknown',
          joinDate: null,
          role: 'STUDENT'
        };
      }

      // summary 정보 설정
      setSummary({
        ...userInfo,
        totalEnrollments: studentEnrollments.length,
        lastActiveAt: studentEnrollments.reduce((latest, curr) => {
          const currDate = new Date(curr.enrolledAt);
          return !latest || currDate > new Date(latest) ? curr.enrolledAt : latest;
        }, null)
      });
    } catch (error) {
      console.error("백업 학생 정보 조회 실패:", error);
    }
  };

  const fetchLectureProgressForEnrollments = async (enrollmentList) => {
    try {
      if (!enrollmentList || enrollmentList.length === 0) {
        setLectureProgress([]);
        return;
      }

      // 취소된 수강 내역 제외하고 진도율 계산
      const activeEnrollments = enrollmentList.filter(enrollment =>
        enrollment.status === 'ENROLLED' || enrollment.status === 'COMPLETED'
      );

      if (activeEnrollments.length === 0) {
        setLectureProgress([]);
        return;
      }

      // 관리자 API에서 진도율 정보가 포함된 수강 내역을 가져오므로
      // 별도 계산 없이 바로 사용
      const progressList = activeEnrollments.map(enrollment => ({
        courseId: enrollment.courseId,
        courseName: enrollment.courseTitle,
        progressRate: enrollment.progressRate || 0,
        completedLectures: enrollment.completedLectures || 0,
        totalLectures: enrollment.totalLectures || 0,
        enrollmentStatus: enrollment.status
      }));

      setLectureProgress(progressList);
      console.log("✅ 강좌별 진도율 조회 성공:", progressList);
    } catch (error) {
      console.error("강의 진도 조회 실패:", error);
      setLectureProgress([]);
    }
  };

  const fetchCancelRequests = async () => {
    try {
      const response = await fetch(`/admin/cancel-requests?studentId=${studentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setCancelRequests(Array.isArray(data) ? data : []);
      } else {
        setCancelRequests([]);
      }
    } catch (error) {
      console.error("취소 요청 조회 실패:", error);
      setCancelRequests([]);
    }
  };

  const fetchEnrollments = async () => {
    try {
      const enrollmentResponse = await fetch('/admin/enrollment', {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include"
      });

      if (enrollmentResponse.ok) {
        const allEnrollments = await enrollmentResponse.json();
        const enrollmentList = Array.isArray(allEnrollments) ? allEnrollments : [];

        // 해당 학생의 수강내역만 필터링
        const studentEnrollments = enrollmentList.filter(enrollment => {
          const enrollmentStudentId = String(enrollment.userId || enrollment.studentId);
          return enrollmentStudentId === String(studentId);
        });

        setEnrollments(studentEnrollments);

        // 수강 내역이 설정된 후 강의 진도 조회
        await fetchLectureProgressForEnrollments(studentEnrollments);
      } else {
        setEnrollments([]);
        setLectureProgress([]);
      }
    } catch (error) {
      console.error("수강 내역 조회 실패:", error);
      setEnrollments([]);
      setLectureProgress([]);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const summaryMetrics = useMemo(() => {
    const base = summary || {};
    const counts = { ENROLLED: 0, COMPLETED: 0, CANCELED: 0 };

    // 진도율 맵 생성
    const progressMap = {};
    lectureProgress.forEach(progress => {
      progressMap[progress.courseId] = progress.progressRate || 0;
    });

    enrollments.forEach((enrollment) => {
      const normalized = normalizeStatus(enrollment.status);
      
      // 진도율 100%인 강좌는 완료로 분류
      if (normalized === 'ENROLLED') {
        const progressRate = progressMap[enrollment.courseId] || 0;
        if (progressRate === 100) {
          counts.COMPLETED += 1;
        } else {
          counts.ENROLLED += 1;
        }
      } else if (counts[normalized] !== undefined) {
        counts[normalized] += 1;
      }
    });

    // 총 수강신청은 현재 상태들의 합으로 계산 (백엔드 totalEnrollments는 전체 이력이므로 사용하지 않음)
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const canceled = counts.CANCELED;
    const cancelRate = total > 0 ? ((canceled / total) * 100).toFixed(1) : "0.0";

    return {
      name: base.name,
      loginId: base.loginId || base.email,
      totalEnrollments: total,
      counts,
      cancelRate,
      lastActiveAt: base.lastActiveAt
    };
  }, [summary, enrollments, lectureProgress]);

  const groupedProgress = useMemo(() => {
    // 이미 강좌별로 진도율이 계산되어 있는 상태이므로 그대로 사용
    return lectureProgress.map(course => ({
      courseId: course.courseId,
      courseTitle: course.courseName,
      progressRate: course.progressRate,
      completedLectures: course.completedLectures,
      totalLectures: course.totalLectures,
      enrollmentStatus: course.enrollmentStatus
    }));
  }, [lectureProgress]);

  const updateReason = (requestId, value) => {
    setReasonByRequest((prev) => ({
      ...prev,
      [requestId]: value
    }));
  };

  const handleApprove = async (request) => {
    const requestId = request.requestId || request.id;
    if (!requestId) return;

    try {
      setProcessingRequestId(requestId);
      const response = await fetch(`/admin/cancel-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: reasonByRequest[requestId] || "" })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "취소 승인에 실패했습니다.");
      }

      setCancelRequests((prev) => prev.filter((item) => (item.requestId || item.id) !== requestId));
      // 취소 승인 후 데이터 다시 로드
      await fetchStudentData();
    } catch (error) {
      console.error("취소 승인 실패:", error);
      alert(error.message || "취소 승인 중 오류가 발생했습니다.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleReject = async (request) => {
    const requestId = request.requestId || request.id;
    if (!requestId) return;

    try {
      setProcessingRequestId(requestId);
      const response = await fetch(`/admin/cancel-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: reasonByRequest[requestId] || "" })
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "취소 반려에 실패했습니다.");
      }

      setCancelRequests((prev) => prev.filter((item) => (item.requestId || item.id) !== requestId));
      // 취소 거절 후 데이터 다시 로드
      await fetchStudentData();
    } catch (error) {
      console.error("취소 반려 실패:", error);
      alert(error.message || "취소 반려 중 오류가 발생했습니다.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <>
      <Nav />
      <div className="min-h-screen bg-white pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

          <AdminSidebar />

          <main className="flex-1 min-w-0">
            {/* 헤더 */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {summaryMetrics.name || "학생 상세 정보"}
                </h1>
                <p className="text-gray-500">
                  로그인 ID: <span className="text-gray-900 font-medium">{summaryMetrics.loginId || "-"}</span>
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/users/students")}
                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                목록으로
              </Button>
            </div>

            {/* 통계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[
                { label: "전체", value: summaryMetrics.totalEnrollments, color: "text-gray-900", filter: "ALL" },
                { label: "수강 중", value: summaryMetrics.counts.ENROLLED, color: "text-emerald-600", filter: "ENROLLED" },
                { label: "수강 완료", value: summaryMetrics.counts.COMPLETED, color: "text-blue-600", filter: "COMPLETED" },
              ].map((stat, i) => (
                <Card 
                  key={i} 
                  className={`p-4 bg-white border-gray-200 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    statusFilter === stat.filter ? 'ring-2 ring-primary border-primary' : ''
                  }`}
                  onClick={() => setStatusFilter(stat.filter)}
                >
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  {stat.sub && <div className="text-[10px] text-gray-400 mt-1">{stat.sub}</div>}
                </Card>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent p-0 gap-8 h-12 border-b border-gray-200 rounded-none w-full justify-start mb-8">
                <TabsTrigger
                  value="enrollments"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 h-full font-bold text-gray-500"
                >
                  수강 이력
                </TabsTrigger>
                <TabsTrigger
                  value="progress"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 h-full font-bold text-gray-500"
                >
                  강의 진도
                </TabsTrigger>
                <TabsTrigger
                  value="cancel-requests"
                  className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none shadow-none px-0 h-full font-bold text-gray-500"
                >
                  수강 취소 요청
                </TabsTrigger>
              </TabsList>

              <TabsContent value="enrollments" className="mt-0">
                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50 border-b border-gray-100">
                      <TableRow>
                        <TableHead className="text-center text-gray-600 font-bold">강좌명</TableHead>
                        <TableHead className="text-center w-[120px] text-gray-600 font-bold">상태</TableHead>
                        <TableHead className="text-center w-[160px] text-gray-600 font-bold">신청일</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-20">
                            <div className="flex justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredEnrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-20 text-gray-400">
                            {statusFilter === "ALL" ? "수강 이력이 없습니다." : `${statusLabel(statusFilter)} 상태의 강좌가 없습니다.`}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredEnrollments.map((enrollment) => {
                          const actualStatus = getEnrollmentActualStatus(enrollment);
                          return (
                            <TableRow key={enrollment.enrollmentId || enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="text-center font-medium text-gray-900 border-r border-gray-50">
                                {enrollment.courseTitle || enrollment.course?.title || "-"}
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge className={`${statusBadgeClass(actualStatus)} font-medium border-0`}>
                                  {statusLabel(actualStatus)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center text-sm text-gray-500">
                                {formatDate(enrollment.enrolledAt)}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              <TabsContent value="progress" className="mt-0">
                <Card className="p-6 bg-white border-gray-200 shadow-sm">
                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : groupedProgress.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      강의 진도 데이터가 없습니다.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {groupedProgress.map((course) => (
                        <div key={course.courseId} className="bg-gray-50/50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
                          <div className="flex items-start justify-between gap-4 mb-4">
                            <h3 className="font-bold text-gray-900 flex-1">{course.courseTitle}</h3>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xl font-bold text-primary">{course.progressRate}%</div>
                              <div className="text-[11px] text-gray-400 font-medium">
                                {course.completedLectures}/{course.totalLectures} 완료
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                                style={{ width: `${course.progressRate}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </TabsContent>

              <TabsContent value="cancel-requests" className="mt-0">
                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span>승인/반려 시 해당 학생의 수강 상태가 자동으로 업데이트됩니다.</span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : cancelRequests.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                      처리 대기 중인 취소 요청이 없습니다.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader className="bg-gray-50 border-b border-gray-100">
                        <TableRow>
                          <TableHead className="text-center text-gray-600 font-bold">강좌명</TableHead>
                          <TableHead className="text-center w-[140px] text-gray-600 font-bold">요청일</TableHead>
                          <TableHead className="text-center w-[100px] text-gray-600 font-bold">진행률</TableHead>
                          <TableHead className="text-center text-gray-600 font-bold">처리 사유 입력</TableHead>
                          <TableHead className="text-center w-[180px] text-gray-600 font-bold">관리</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cancelRequests.map((request) => {
                          const requestId = request.requestId || request.id;
                          const isProcessing = processingRequestId === requestId;
                          return (
                            <TableRow key={requestId} className="hover:bg-gray-50/50 transition-colors">
                              <TableCell className="text-center font-bold text-gray-900">
                                {request.courseTitle || request.course?.title || "-"}
                              </TableCell>
                              <TableCell className="text-center text-sm text-gray-500">
                                {formatDate(request.requestedAt || request.createdAt)}
                              </TableCell>
                              <TableCell className="text-center font-bold text-gray-900">
                                {request.currentProgress ?? request.progressRate ?? 0}%
                              </TableCell>
                              <TableCell className="p-4">
                                <Textarea
                                  value={reasonByRequest[requestId] || ""}
                                  onChange={(event) => updateReason(requestId, event.target.value)}
                                  placeholder="사유를 입력하세요 (선택)"
                                  className="min-h-[60px] bg-white border-gray-200 focus:ring-primary text-sm"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col gap-2 p-2">
                                  <Button
                                    size="sm"
                                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold h-9"
                                    disabled={isProcessing}
                                    onClick={() => handleApprove(request)}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                                    취소 승인
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full border-gray-200 text-gray-600 hover:bg-gray-50 font-medium h-9"
                                    disabled={isProcessing}
                                    onClick={() => handleReject(request)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1.5 text-gray-400" />
                                    취소 반려
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
      <Tail />
    </>
  );
}

export default AdminStudentDetail;
