import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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

    return (
        <>
            <Nav />
            {!instructor ? (<p className="text-center text-red-500">강사 정보를 불러올 수 없습니다.</p>) : (
                <section className="container mx-auto px-4 py-16 max-w-2xl">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-2xl">{instructor.name}</CardTitle>
                                    <CardDescription>{instructor.email}</CardDescription>
                                </div>
                                {instructor.status == 'ACTIVE' ? (
                                    <Badge variant="secondary">승인 완료</Badge>) : (
                                    <Badge variant="destructive">승인 필요</Badge>)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* 기본 정보 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">로그인 ID</p>
                                    <p className="font-medium">{instructor.loginId || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">경력</p>
                                    <p className="font-medium">{instructor.careerYears ? `${instructor.careerYears}년` : '-'}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* 자기소개 */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">자기소개</p>
                                <p className="font-medium whitespace-pre-wrap">{instructor.bio || '등록된 자기소개가 없습니다.'}</p>
                            </div>

                            <Separator />

                            {/* 이력서 */}
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">이력서</p>
                                {instructor.resumeFilePath ? (
                                    <Button
                                        variant="outline"
                                        onClick={downloadResume}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        📁 이력서 다운로드
                                    </Button>
                                ) : (
                                    <p className="text-muted-foreground">등록된 이력서가 없습니다.</p>
                                )}
                            </div>

                            <Separator />

                            {/* 날짜 정보 */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">신청일</p>
                                    <p className="font-medium">{formatDate(instructor.appliedAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">승인일</p>
                                    <p className="font-medium">{formatDate(instructor.approvedAt)}</p>
                                </div>
                            </div>

                            <Separator />

                            {/* 버튼 영역 */}
                            <div className="flex gap-4 justify-end pt-4">
                                <Button variant="outline" onClick={() => navigate('/admin/dashboard')}>
                                    목록으로
                                </Button>
                                {instructor.status == 'ACTIVE' ? (
                                    <Button variant="ghost" disable>승인완료</Button>) : (
                                    <Button onClick={approveInstructor}>강사 승인</Button>)}

                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}

            <Tail />
        </>
    );
}

export default AdminApproch;
