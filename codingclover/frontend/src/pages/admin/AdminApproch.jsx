import Nav from "@/components/Nav";
import AdminSidebar from "@/components/AdminSidebar";
import Tail from "@/components/Tail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Briefcase, FileText, Mail, User, CheckCircle, ArrowLeft, Download, ShieldCheck, Clock, Trash2 } from "lucide-react";

function AdminApproch() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [instructor, setInstructor] = useState(null);
    const [loading, setLoading] = useState(true);

    // 이력서 다운로드 함수
    const downloadResume = async () => {
        if (!instructor?.resumeFilePath) {
            alert('이력서 파일이 없습니다.');
            return;
        }

        try {
            const response = await fetch(`/api/instructor/download-resume?filePath=${encodeURIComponent(instructor.resumeFilePath)}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `resume_${instructor.userId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } else {
                alert('파일 다운로드에 실패했습니다.');
            }
        } catch (error) {
            console.error('Error downloading resume:', error);
            alert('파일 다운로드 중 오류가 발생했습니다.');
        }
    };

    // 강사 상세 정보 불러오기
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!userId) {
            alert('잘못된 접근입니다.');
            navigate('/admin/dashboard');
            return;
        }

        fetchInstructorDetail();
    }, [userId]);

    const fetchInstructorDetail = () => {
        setLoading(true);
        fetch(`/admin/users/instructors/${userId}`, {
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setInstructor(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('강사 정보 로드 실패', error);
                setLoading(false);
            });
    };

    // 강사 반려 처리
    const handleRejectClick = () => {
        setIsRejectDialogOpen(true);
        setRejectReason('');
    };

    const submitReject = () => {
        if (!rejectReason.trim()) {
            alert("반려 사유를 입력해야 합니다.");
            return;
        }

        fetch(`/admin/users/instructors/${userId}/reject`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason: rejectReason }),
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(() => {
                setInstructor(prev => ({
                    ...prev,
                    status: 'SUSPENDED',
                    profileStatus: 'REJECTED'
                }));
                alert('강사 반려 처리가 완료되었습니다.');
                setIsRejectDialogOpen(false);
                // navigate('/admin/dashboard'); // 반려 후 목록으로 이동하지 않고 현재 페이지 유지 (상태 변경 확인)
            })
            .catch((error) => {
                console.error('강사 반려 실패', error);
                alert('반려 처리에 실패했습니다.');
            });
    };

    // 강사 삭제 처리
    const handleDeleteInstructor = () => {
        fetch(`/admin/users/instructors/${userId}/delete`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(() => {
                alert('강사가 삭제되었습니다.');
                setIsDeleteDialogOpen(false);
                navigate('/admin/users/instructors'); // 목록으로 이동
            })
            .catch((error) => {
                console.error('강사 삭제 실패', error);
                alert('삭제에 실패했습니다.');
            });
    };

    // 강사 승인 처리
    const approveInstructor = () => {
        // 필수 자료 검증 (API 호출 전)
        if (!instructor || !instructor.name || !instructor.email || !instructor.bio || !instructor.careerYears || !instructor.resumeFilePath) {
            alert('등록된 강사 자료가 없습니다.');
            return;
        }

        if (!confirm('해당 강사를 승인하시겠습니까?')) return;

        fetch(`/admin/users/instructors/${userId}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(() => {
                setInstructor(prev => ({
                    ...prev,
                    status: 'ACTIVE'
                }));
                alert('강사 승인이 완료되었습니다.');
                navigate('/admin/users/instructors');
            })
            .catch((error) => {
                console.error('강사 승인 실패', error);
                alert('승인에 실패했습니다.');
            });
    };

    // 날짜 포맷팅
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            <Nav />
            <div className="min-h-screen bg-gray-50 pt-20 pb-20">
                <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row gap-8">

                    <AdminSidebar />

                    <main className="flex-1 min-w-0">
                        {/* 헤더 */}
                        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    강사 승인 심사
                                </h1>
                                <p className="text-gray-500">
                                    제출된 프로필과 이력서를 검토하여 강사 활동 승인 여부를 결정합니다.
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="bg-white border-gray-200 text-gray-600 hover:bg-gray-50 h-10 px-4 rounded-lg self-start md:self-center"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                목록으로
                            </Button>
                        </div>

                        {!instructor ? (
                            <Card className="p-12 text-center bg-white border-gray-200 shadow-sm rounded-xl">
                                <div className="text-gray-400 mb-4">
                                    <User className="w-12 h-12 mx-auto opacity-20" />
                                </div>
                                <p className="text-gray-500">강사 정보를 불러올 수 없습니다.</p>
                            </Card>
                        ) : (
                            <div className="space-y-6">
                                {/* 프로필 카드 */}
                                <Card className="bg-white border-gray-200 shadow-sm overflow-hidden rounded-xl">
                                    <div className="p-8 border-b border-gray-100 bg-slate-50/50">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl font-bold text-primary shadow-sm border border-primary/20">
                                                    {instructor.name[0]}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h2 className="text-2xl font-bold text-gray-900">{instructor.name}</h2>
                                                        {instructor.status === 'ACTIVE' ? (
                                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0">승인 완료</Badge>
                                                        ) : instructor.profileStatus === 'REJECTED' ? (
                                                            <Badge variant="destructive" className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-0">반려됨</Badge>
                                                        ) : (
                                                            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0">승인 대기중</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                        <Mail className="w-4 h-4" />
                                                        {instructor.email}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setIsDeleteDialogOpen(true)}
                                                    className="flex-1 md:flex-none text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    강사 삭제
                                                </Button>
                                            </div>
                                        </div>
                                    </div>

                                    <CardContent className="p-8 space-y-10">
                                        {/* 기본 정보 그리드 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider">로그인 ID</Label>
                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-700">
                                                    {instructor.loginId || '-'}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-gray-400 text-xs font-bold uppercase tracking-wider">경력 사항</Label>
                                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 font-medium text-gray-700">
                                                    {instructor.careerYears ? `${instructor.careerYears}년` : '-'}
                                                </div>
                                            </div>
                                        </div>

                                        {/* 자기소개 */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                <FileText className="w-5 h-5 text-primary" />
                                                <h3>자기소개</h3>
                                            </div>
                                            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {instructor.bio || '등록된 자기소개가 없습니다.'}
                                            </div>
                                        </div>

                                        {/* 이력서 섹션 */}
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-gray-900 font-bold">
                                                <Download className="w-5 h-5 text-primary" />
                                                <h3>이력서 및 증빙자료</h3>
                                            </div>
                                            {instructor.resumeFilePath ? (
                                                <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center border border-primary/20">
                                                            <FileText className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">이력서_준비됨.pdf</div>
                                                            <div className="text-xs text-gray-500">클릭하여 파일을 다운로드하세요.</div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={downloadResume}
                                                        className="bg-primary hover:bg-primary/90 text-white font-bold px-6"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" />
                                                        다운로드
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-gray-400">
                                                    등록된 이력서가 없습니다.
                                                </div>
                                            )}
                                        </div>

                                        {/* 타임스탬프 */}
                                        <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                                <Calendar className="w-4 h-4" />
                                                <span>신청일: <span className="text-gray-900 font-medium">{formatDate(instructor.appliedAt)}</span></span>
                                            </div>
                                            {instructor.approvedAt && (
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                    <span>승인일: <span className="text-gray-900 font-medium">{formatDate(instructor.approvedAt)}</span></span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>

                                    {/* 하단 액션바 */}
                                    <div className="p-8 bg-slate-900 flex justify-end gap-3 rounded-b-xl">
                                        {instructor.status === 'ACTIVE' ? (
                                            <>
                                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 text-sm mr-auto font-bold">
                                                    현재 승인된 상태입니다
                                                </Badge>
                                                <Button
                                                    onClick={handleRejectClick}
                                                    variant="outline"
                                                    className="bg-transparent border-rose-500/50 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-all px-8 h-12"
                                                >
                                                    승인 취소 (반려)
                                                </Button>
                                            </>
                                        ) : instructor.profileStatus === 'REJECTED' ? (
                                            <>
                                                <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2 text-sm mr-auto font-bold">
                                                    현재 반려된 상태입니다
                                                </Badge>
                                                <Button
                                                    onClick={approveInstructor}
                                                    className="bg-primary hover:bg-primary/90 text-white font-bold px-10 h-12 shadow-lg shadow-primary/20"
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    재승인 처리
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button
                                                    onClick={handleRejectClick}
                                                    variant="outline"
                                                    className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white font-bold transition-all px-8 h-12"
                                                >
                                                    반려
                                                </Button>
                                                <Button
                                                    onClick={approveInstructor}
                                                    className="bg-primary hover:bg-primary/90 text-white font-bold px-10 h-12 shadow-lg shadow-primary/20"
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    강사 승인 확정
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-rose-500" /> 강사 반려 처리
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            해당 강사 신청을 반려합니다. 구체적인 반려 사유를 입력하시면 강사에게 알림이 전송됩니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="rejectReason" className="font-bold text-gray-700">반려 사유</Label>
                            <Textarea
                                id="rejectReason"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="예: 학력/경력 증빙 서류가 불충분합니다. 보완 후 다시 신청해주세요."
                                className="min-h-[120px] focus:ring-rose-500 border-gray-200"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="px-6">취소</Button>
                        <Button variant="destructive" onClick={submitReject} className="px-6 font-bold">반려 확정</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <Trash2 className="w-5 h-5 text-rose-500" /> 강사 영구 삭제
                        </DialogTitle>
                        <DialogDescription className="pt-2 text-gray-600">
                            정말로 이 강사 계정을 삭제하시겠습니까? <br />
                            강사가 등록한 모든 강좌와 데이터가 삭제되며, 이 작업은 <strong className="text-rose-500">절대 되돌릴 수 없습니다.</strong>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="pt-4 gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="px-6">취소</Button>
                        <Button variant="destructive" onClick={handleDeleteInstructor} className="px-6 font-bold">강사 삭제 확정</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Tail />
        </>
    );
}

export default AdminApproch;
