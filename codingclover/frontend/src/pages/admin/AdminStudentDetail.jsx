import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNav from "@/components/AdminNav";
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
import { ChevronLeft, CheckCircle2, XCircle } from "lucide-react";

function AdminStudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [lectureProgress, setLectureProgress] = useState([]);
  const [cancelRequests, setCancelRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("enrollments");
  const [reasonByRequest, setReasonByRequest] = useState({});
  const [processingRequestId, setProcessingRequestId] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeStatus = (status) => {
    if (status === "CANCELLED") return "CANCELED";
    return status;
  };

  const statusLabel = (status) => {
    switch (status) {
      case "ENROLLED":
        return "수강중";
      case "COMPLETED":
        return "완료";
      case "CANCEL_REQUESTED":
        return "취소요청";
      case "CANCELED":
        return "취소";
      default:
        return status || "-";
    }
  };

  const statusBadgeClass = (status) => {
    switch (status) {
      case "ENROLLED":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "COMPLETED":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
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

    enrollments.forEach((enrollment) => {
      const normalized = normalizeStatus(enrollment.status);
      if (counts[normalized] !== undefined) {
        counts[normalized] += 1;
      }
    });

    const total = base.totalEnrollments ?? enrollments.length;
    const canceled = base.canceledCount ?? counts.CANCELED;
    const cancelRate = total > 0 ? ((canceled / total) * 100).toFixed(1) : "0.0";

    return {
      name: base.name,
      loginId: base.loginId || base.email,
      totalEnrollments: total,
      counts,
      cancelRate,
      lastActiveAt: base.lastActiveAt
    };
  }, [summary, enrollments]);

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
    } catch (error) {
      console.error("취소 반려 실패:", error);
      alert(error.message || "취소 반려 중 오류가 발생했습니다.");
    } finally {
      setProcessingRequestId(null);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="fixed inset-0 z-[-1] bg-background">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="pt-32 pb-20 container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <ChevronLeft className="h-4 w-4" />
              학생 상세
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground mb-2">
              {summaryMetrics.name || "학생"}
            </h1>
            <p className="text-muted-foreground">로그인 ID: {summaryMetrics.loginId || "-"}</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/admin/students")}>목록으로</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
            <div className="text-sm text-muted-foreground">총 수강 신청</div>
            <div className="text-2xl font-bold mt-1">{summaryMetrics.totalEnrollments}</div>
          </Card>
          <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
            <div className="text-sm text-muted-foreground">ENROLLED</div>
            <div className="text-2xl font-bold mt-1 text-emerald-500">{summaryMetrics.counts.ENROLLED}</div>
          </Card>
          <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
            <div className="text-sm text-muted-foreground">COMPLETED</div>
            <div className="text-2xl font-bold mt-1 text-purple-500">{summaryMetrics.counts.COMPLETED}</div>
          </Card>
          <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
            <div className="text-sm text-muted-foreground">CANCELED</div>
            <div className="text-2xl font-bold mt-1 text-rose-500">{summaryMetrics.counts.CANCELED}</div>
          </Card>
          <Card className="p-4 bg-background/60 backdrop-blur-xl border-border/50">
            <div className="text-sm text-muted-foreground">취소율</div>
            <div className="text-2xl font-bold mt-1">{summaryMetrics.cancelRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">최근 활동: {formatDate(summaryMetrics.lastActiveAt)}</div>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="enrollments">수강 이력</TabsTrigger>
            <TabsTrigger value="progress">강의 진도</TabsTrigger>
            <TabsTrigger value="cancel-requests">수강 취소 요청 관리</TabsTrigger>
          </TabsList>

          <TabsContent value="enrollments">
            <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-xl overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-center">강좌명</TableHead>
                    <TableHead className="text-center w-[120px]">상태</TableHead>
                    <TableHead className="text-center w-[160px]">신청일</TableHead>
                    <TableHead className="text-center w-[180px]">완료/취소일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16">
                        로딩중...
                      </TableCell>
                    </TableRow>
                  ) : enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-muted-foreground">
                        수강 이력이 없습니다.
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((enrollment) => {
                      const normalized = normalizeStatus(enrollment.status);
                      const completedOrCanceledAt =
                        normalized === "COMPLETED"
                          ? enrollment.completedAt
                          : normalized === "CANCELED"
                            ? enrollment.canceledAt
                            : "-";
                      return (
                        <TableRow key={enrollment.enrollmentId || enrollment.id}>
                          <TableCell className="text-center">
                            {enrollment.courseTitle || enrollment.course?.title || "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={statusBadgeClass(normalized)}>
                              {statusLabel(normalized)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {formatDate(enrollment.enrolledAt)}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {formatDate(completedOrCanceledAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="p-6 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl">
              {loading ? (
                <div className="text-center py-16">로딩중...</div>
              ) : groupedProgress.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  강의 진도 데이터가 없습니다.
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedProgress.map((course) => (
                    <div key={course.courseId} className="border border-border/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{course.courseTitle}</h3>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{course.progressRate}%</div>
                          <div className="text-sm text-muted-foreground">
                            {course.completedLectures}/{course.totalLectures} 강의 완료
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300" 
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

          <TabsContent value="cancel-requests">
            <Card className="p-6 bg-background/60 backdrop-blur-xl border-border/50 shadow-xl">
              <div className="mb-4 text-sm text-muted-foreground">
                취소 요청은 처리 전 상태만 표시됩니다. 승인/반려는 이 탭에서만 가능합니다.
              </div>

              {loading ? (
                <div className="text-center py-16">로딩중...</div>
              ) : cancelRequests.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  처리할 취소 요청이 없습니다.
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-center">강좌명</TableHead>
                      <TableHead className="text-center w-[160px]">요청일</TableHead>
                      <TableHead className="text-center w-[140px]">현재 진행률</TableHead>
                      <TableHead className="text-center">사유</TableHead>
                      <TableHead className="text-center w-[220px]">처리</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cancelRequests.map((request) => {
                      const requestId = request.requestId || request.id;
                      const isProcessing = processingRequestId === requestId;
                      return (
                        <TableRow key={requestId}>
                          <TableCell className="text-center">
                            {request.courseTitle || request.course?.title || "-"}
                          </TableCell>
                          <TableCell className="text-center text-sm text-muted-foreground">
                            {formatDate(request.requestedAt || request.createdAt)}
                          </TableCell>
                          <TableCell className="text-center">
                            {request.currentProgress ?? request.progressRate ?? 0}%
                          </TableCell>
                          <TableCell className="text-center">
                            <Textarea
                              value={reasonByRequest[requestId] || ""}
                              onChange={(event) => updateReason(requestId, event.target.value)}
                              placeholder="승인/반려 사유를 입력하세요"
                              className="min-h-[60px]"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                className="w-full bg-rose-600 hover:bg-rose-700"
                                disabled={isProcessing}
                                onClick={() => handleApprove(request)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                취소 승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
                                disabled={isProcessing}
                                onClick={() => handleReject(request)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
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
      </div>

      <Tail />
    </>
  );
}

export default AdminStudentDetail;
