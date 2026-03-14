import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ArrowLeft,
    Trash2,
    RotateCcw,
    FileText,
    Clock,
    Trophy,
    AlertTriangle,
    ClipboardList,
    Users as UsersIcon,
    Calendar,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

function AdminExamDetail() {
    const { examId } = useParams();
    const navigate = useNavigate();
    const [exam, setExam] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [attemptsPage, setAttemptsPage] = useState(1);
    const attemptsPerPage = 10;
    const [loading, setLoading] = useState(true);
    const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);

    // Modals
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);
    const [reason, setReason] = useState("");

    useEffect(() => {
        const fetchExamData = async () => {
            try {
                const examRes = await fetch(`/admin/exam/${examId}`, { credentials: 'include' });
                const examData = await examRes.json();
                setExam(examData);

                const attemptsRes = await fetch(`/admin/exam/${examId}/attempts`, { credentials: 'include' });
                if (attemptsRes.ok) {
                    const attemptsData = await attemptsRes.json();
                    setAttempts(attemptsData);
                }
            } catch (err) {
                console.error(err);
                toast.error("데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchExamData();
    }, [examId]);

    const handleAction = (type) => {
        if (!reason.trim()) {
            toast.warning("사유를 입력해 주세요.");
            return;
        }

        const url = type === 'delete'
            ? `/admin/exam/${examId}?reason=${encodeURIComponent(reason)}`
            : `/admin/exam/${examId}/revision`;

        const method = type === 'delete' ? 'DELETE' : 'POST';
        const body = type === 'revision' ? reason : null;

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'text/plain' },
            body: body,
            credentials: 'include'
        })
            .then(res => {
                if (res.ok) {
                    toast.success(type === 'delete' ? "시험이 삭제되었습니다." : "수정 요청이 전송되었습니다.");
                    if (type === 'delete') navigate('/admin/exams');
                    else {
                        setShowRevisionModal(false);
                        setReason("");
                    }
                } else {
                    toast.error("작업 처리에 실패했습니다.");
                }
            })
            .catch(() => toast.error("서버 오류가 발생했습니다."));
    }

    // Sorting and Pagination logic for attempts
    const sortedAttempts = [...attempts].sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt));
    const indexOfLastAttempt = attemptsPage * attemptsPerPage;
    const indexOfFirstAttempt = indexOfLastAttempt - attemptsPerPage;
    const currentAttempts = sortedAttempts.slice(indexOfFirstAttempt, indexOfLastAttempt);
    const totalAttemptsPages = Math.ceil(sortedAttempts.length / attemptsPerPage);

    const handleAttemptsPageChange = (page) => {
        if (page >= 1 && page <= totalAttemptsPages) setAttemptsPage(page);
    };

    if (loading) return <div className="pt-20 text-center">Loading...</div>;
    if (!exam) return <div className="pt-20 text-center">시험을 찾을 수 없습니다.</div>;

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-white pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex gap-8">
                    <AdminSidebar />
                    <main className="flex-1">
                        <button
                            onClick={() => navigate('/admin/exams')}
                            className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            목록으로 돌아가기
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left: Questions List */}
                            <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <ClipboardList className="h-5 w-5 text-primary" />
                                        문제 목록
                                        <span className="text-sm font-normal text-gray-400 ml-1">({exam.questions?.length || 0}문항)</span>
                                    </h2>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-none border-gray-200 text-gray-600 hover:bg-gray-50 h-8 gap-1.5"
                                        onClick={() => setIsQuestionsExpanded(!isQuestionsExpanded)}
                                    >
                                        {isQuestionsExpanded ? (
                                            <>
                                                접기 <ChevronUp className="h-3.5 w-3.5" />
                                            </>
                                        ) : (
                                            <>
                                                전체보기 <ChevronDown className="h-3.5 w-3.5" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {isQuestionsExpanded && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                        {exam.questions && exam.questions.length > 0 ? (
                                            exam.questions.map((q, idx) => (
                                                <Card key={idx} className="relative transition-all hover:shadow-md border border-border rounded-none shadow-none overflow-hidden">
                                                    <div className="bg-muted/30 p-4 border-b border-border">
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                                                                {idx + 1}
                                                            </span>
                                                            <span className="font-bold text-gray-900 leading-none">문제 #{idx + 1}</span>
                                                        </div>
                                                    </div>
                                                    <div className="p-8 space-y-6">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                                                                {q.questionText}
                                                            </h3>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                                                {[q.option1, q.option2, q.option3, q.option4, q.option5].filter(Boolean).map((opt, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`p-4 rounded-none border text-sm transition-all ${(i + 1) === q.correctAnswer
                                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 font-semibold ring-1 ring-emerald-500/20"
                                                                            : "bg-slate-50 border-slate-100 text-gray-600"
                                                                            }`}
                                                                    >
                                                                        <span className="mr-3 text-current opacity-50">{i + 1}.</span>
                                                                        {opt}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium pt-4 border-t border-border">
                                                            정답: {q.correctAnswer}번
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))
                                        ) : (
                                            <div className="py-20 text-center bg-white border border-dashed border-gray-200 text-gray-400">
                                                등록된 문제가 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Student Submission Status */}
                                <div className="pt-8">
                                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                                        <UsersIcon className="h-5 w-5 text-primary" />
                                        학생 응시 현황
                                        <span className="text-sm font-normal text-gray-400 ml-1">({attempts.length}건)</span>
                                    </h2>

                                    <Card className="rounded-none border-border shadow-none overflow-hidden bg-white">
                                        <Table>
                                            <TableHeader className="bg-gray-50/50 border-b border-gray-100">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[150px] text-gray-600 font-bold">학생명</TableHead>
                                                    <TableHead className="text-center w-[100px] text-gray-600 font-bold">시도</TableHead>
                                                    <TableHead className="text-center w-[100px] text-gray-600 font-bold">점수</TableHead>
                                                    <TableHead className="text-center w-[120px] text-gray-600 font-bold">상태</TableHead>
                                                    <TableHead className="text-right text-gray-600 font-bold">응시 일시</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {currentAttempts.length > 0 ? (
                                                    currentAttempts.map((attempt) => (
                                                        <TableRow key={attempt.attemptId} className="hover:bg-gray-50/50 transition-colors">
                                                            <TableCell className="font-medium text-gray-900">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold">
                                                                        {attempt.userName.substring(0, 1)}
                                                                    </div>
                                                                    {attempt.userName}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center text-gray-500">
                                                                {attempt.attemptNo}회차
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold text-gray-900">
                                                                {attempt.score}점
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {attempt.passed ? (
                                                                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-medium hover:bg-emerald-50 shadow-none">
                                                                        <CheckCircle2 className="w-3 h-3 mr-1" /> 합격
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-100 font-medium hover:bg-rose-50 shadow-none">
                                                                        <XCircle className="w-3 h-3 mr-1" /> 불합격
                                                                    </Badge>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-right text-xs text-gray-400">
                                                                <div className="flex items-center justify-end gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(attempt.attemptedAt).toLocaleString()}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                                                            아직 응시한 학생이 없습니다.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </Card>

                                    {/* Pagination */}
                                    {totalAttemptsPages >= 1 && (
                                        <div className="flex justify-center items-center gap-2 pt-8">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAttemptsPageChange(attemptsPage - 1)}
                                                disabled={attemptsPage === 1}
                                                className="h-9 px-3 rounded-none border-gray-300"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>

                                            {Array.from({ length: totalAttemptsPages }, (_, i) => i + 1).map(page => (
                                                <Button
                                                    key={page}
                                                    variant={attemptsPage === page ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => handleAttemptsPageChange(page)}
                                                    className={`h-9 w-9 rounded-none border ${attemptsPage === page ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
                                                >
                                                    {page}
                                                </Button>
                                            ))}

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAttemptsPageChange(attemptsPage + 1)}
                                                disabled={attemptsPage === totalAttemptsPages}
                                                className="h-9 px-3 rounded-none border-gray-300"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right: Info & Actions Sidebar */}
                            <div className="space-y-6 order-1 lg:order-2">
                                <Card className="bg-white border-border rounded-none shadow-none overflow-hidden sticky top-24">
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h1 className="text-xl font-bold text-gray-900 leading-tight">{exam.title}</h1>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                <span className="font-semibold text-primary">{exam.courseTitle}</span>
                                            </p>
                                        </div>

                                        <Separator className="bg-gray-100" />

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">출제 강사</span>
                                                <span className="font-medium text-gray-900">{exam.instructorName}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">난이도</span>
                                                <Badge variant="outline" className={
                                                    exam.level === 1 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        exam.level === 2 ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                            "bg-rose-50 text-rose-700 border-rose-100"
                                                }>
                                                    {exam.level === 1 ? "초급" : exam.level === 2 ? "중급" : "고급"}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400">상태</span>
                                                {exam.reuploaded ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0">재업로드됨</Badge>
                                                ) : (
                                                    <Badge className="bg-blue-100 text-blue-700 border-0">정상</Badge>
                                                )}
                                            </div>
                                        </div>

                                        <Separator className="bg-gray-100" />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">제한시간</div>
                                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    {exam.timeLimit}분
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">합격기준</div>
                                                <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                                    <Trophy className="h-3 w-3 text-gray-400" />
                                                    {exam.passScore}점
                                                </div>
                                            </div>
                                        </div>

                                        <Separator className="bg-gray-100" />

                                        <div className="space-y-3 pt-2">
                                            <Button
                                                className="w-full font-bold h-12 bg-slate-900 hover:bg-slate-800 text-white gap-2"
                                                onClick={() => setShowRevisionModal(true)}
                                            >
                                                <RotateCcw className="h-4 w-4" />
                                                수정 요청 보내기
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full font-bold h-12 text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors gap-2"
                                                onClick={() => setShowDeleteModal(true)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                시험 영구 삭제
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </main>
                </div >
            </div >

            {/* Revision Modal */}
            <Dialog open={showRevisionModal} onOpenChange={setShowRevisionModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>시험 수정 요청</DialogTitle>
                        <DialogDescription>
                            강사에게 전달할 수정 요청 사유를 입력해 주세요. 강사가 이 사유를 보고 시험을 수정하게 됩니다.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="예: 3번 문제에 오타가 있으니 수정 부탁드립니다."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[120px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRevisionModal(false)}>취소</Button>
                        <Button onClick={() => handleAction('revision')}>요청 보내기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            시험 삭제 확인
                        </DialogTitle>
                        <DialogDescription>
                            시험을 삭제하시겠습니까? 삭제 사유는 강사에게 알림으로 전달됩니다. 이 작업은 되돌릴 수 없습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="삭제 사유를 입력해 주세요 (필수)"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[120px]"
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>취소</Button>
                        <Button variant="destructive" onClick={() => handleAction('delete')}>삭제하기</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >

            <Tail />
        </>
    );
}

export default AdminExamDetail;
