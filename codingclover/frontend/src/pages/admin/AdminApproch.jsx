import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Briefcase, FileText, Mail, User, CheckCircle, ArrowLeft, Download, ShieldCheck, Clock } from "lucide-react";

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
    useEffect(() => {
        // 먼저 강사 프로필 정보 시도
        fetch(`/admin/users/instructors/${userId}`, {
            method: 'GET',
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
                console.log("강사 상세 데이터 로드 성공", data);
                setInstructor(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('강사 상세 데이터 로딩 실패', error);
                setLoading(false);
            });
    }, [userId]);

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
                navigate('/admin/dashboard');
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

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 relative overflow-hidden">
                <Nav />
                <div className="container mx-auto px-4 py-16 pt-32 flex justify-center items-center h-[80vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-[40%] left-[30%] w-[400px] h-[400px] bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10">
                <Nav />
                <div className='py-8' />

                {!instructor ? (
                    <div className="container mx-auto px-4 py-16 text-center">
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl inline-block">
                            강사 정보를 불러올 수 없습니다.
                        </div>
                    </div>
                ) : (
                    <section className="container mx-auto px-4 py-16 max-w-4xl">
                        <Button
                            variant="ghost"
                            onClick={() => navigate(-1)}
                            className="mb-8 hover:bg-white/50 hover:text-indigo-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            목록으로 돌아가기
                        </Button>

                        <div className="mb-8 text-center">
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">강사 승인 심사</h1>
                            <p className="text-slate-500">제출된 프로필과 이력서를 검토하여 강사 활동 승인 여부를 결정해주세요.</p>
                        </div>

                        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-xl ring-1 ring-white/50 overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border-b border-indigo-100/50 p-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-md ring-2 ring-indigo-50">
                                            {instructor.name[0]}
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                                {instructor.name}
                                                {instructor.status === 'ACTIVE' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                                            </CardTitle>
                                            <CardDescription className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                                <Mail className="w-4 h-4" />
                                                {instructor.email}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    {instructor.status === 'ACTIVE' ? (
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1.5 text-sm font-medium hover:bg-emerald-100">
                                            승인 완료
                                        </Badge>
                                    ) : (
                                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 px-4 py-1.5 text-sm font-medium hover:bg-amber-100 animate-pulse">
                                            승인 대기중
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                {/* 기본 정보 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <User className="w-4 h-4" />
                                            <span className="text-sm font-medium">로그인 ID</span>
                                        </div>
                                        <p className="font-semibold text-slate-800 pl-6">{instructor.loginId || '-'}</p>
                                    </div>
                                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-2 text-slate-500 mb-2">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="text-sm font-medium">경력</span>
                                        </div>
                                        <p className="font-semibold text-slate-800 pl-6">{instructor.careerYears ? `${instructor.careerYears}년` : '-'}</p>
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                {/* 자기소개 */}
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-900 font-semibold mb-4">
                                        <FileText className="w-5 h-5" />
                                        <h3>자기소개</h3>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {instructor.bio || '등록된 자기소개가 없습니다.'}
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                {/* 이력서 */}
                                <div>
                                    <div className="flex items-center gap-2 text-indigo-900 font-semibold mb-4">
                                        <Download className="w-5 h-5" />
                                        <h3>이력서 및 증빙자료</h3>
                                    </div>
                                    {instructor.resumeFilePath ? (
                                        <Button
                                            variant="outline"
                                            onClick={downloadResume}
                                            className="w-full sm:w-auto h-12 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all font-medium"
                                        >
                                            <FileText className="w-4 h-4 mr-2" />
                                            이력서 다운로드 (PDF)
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-slate-400 bg-slate-50 p-3 rounded-lg inline-flex">
                                            <FileText className="w-4 h-4" />
                                            <span className="text-sm">등록된 이력서가 없습니다.</span>
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-slate-100" />

                                {/* 날짜 정보 */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <Clock className="w-4 h-4" />
                                            <span>신청일</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{formatDate(instructor.appliedAt)}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <ShieldCheck className="w-4 h-4" />
                                            <span>승인일</span>
                                        </div>
                                        <span className="font-medium text-slate-800">{formatDate(instructor.approvedAt)}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-3 md:gap-4">
                                {instructor.status === 'ACTIVE' ? (
                                    <Button
                                        variant="outline"
                                        disabled
                                        className="h-12 px-8 bg-emerald-50 text-emerald-600 border-emerald-200 opacity-100"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        이미 승인된 강사입니다
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={approveInstructor}
                                        className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/30 transition-all text-base font-semibold"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        강사 승인 처리
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    </section>
                )}
            </div>
            <Tail />
        </div>
    );
}

export default AdminApproch;
