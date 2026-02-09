import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link, useParams } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function AdminMain() {

    /** id, 난이도, 강좌명, 강사명, 승인상태 */
    const [course, setCourse] = useState([]);
    const [status, setStatus] = useState([]);
    const [lecture, setLecture] = useState([]);

    // 생성 후 24시간 이내면 NEW 배지 표시
    const isNewCourse = (createdAt) => {
        if (!createdAt) return false;

        const created = new Date(createdAt);
        const now = new Date();

        // 24시간 기준
        return (now - created) <= 1000 * 60 * 60 * 24;
    };

    useEffect(() => {
        // 강좌 목록 조회
        fetch('/admin/course/{id}/pending', {
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
            .then((resData) => {
                console.log("강좌 데이터 로드 성공", resData);
                if (Array.isArray(resData)) {
                    setCourse(resData);
                } else if (resData && typeof resData === 'object') {
                    const list = resData.content || resData.list || [resData];
                    setCourse(Array.isArray(list) ? list : [list]);
                }
            })
            .catch((error) => {
                console.error('강좌 데이터 로딩 실패', error);
            });

        // 강사 목록 조회
        fetch('/admin/users/instructors', {
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
                console.log("강사 데이터 로드 성공", data);
                setStatus(data);
            })
            .catch((error) => {
                console.error('강사 데이터 로딩 실패', error);
            });
        // 강의 불러오기
        fetch(`/admin/lectures/pending`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then((data) => {
                console.log("강의 데이터 로드 성공", data);
                setLecture(data);
            })
            .catch((error) => {
                console.error('강의 데이터 로딩 실패', error);
            });
    }, []);

    return (
        <>
            <Nav />
            {/* Background Decoration */}
            <div className="fixed inset-0 z-[-1] bg-background">
                <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="pt-24 pb-20 container mx-auto px-6 max-w-7xl">
                <div className="mb-10">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        관리자 대시보드입니다. 강좌, 강사, 강의 업로드를 관리하세요.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">개설된 강좌</h3>
                        <div className="text-3xl font-bold">{course.length} <span className="text-sm font-normal text-muted-foreground">개</span></div>
                    </div>
                    <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">신규 강사 신청</h3>
                        <div className="text-3xl font-bold text-amber-500">{status.filter(u => u.status === 'SUSPENDED' && u.profileStatus !== 'REJECTED').length} <span className="text-sm font-normal text-muted-foreground">명</span></div>
                    </div>
                    <div className="bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">강의 업로드 대기</h3>
                        <div className="text-3xl font-bold text-purple-500">{lecture.filter(l => l.approvalStatus === 'PENDING').length} <span className="text-sm font-normal text-muted-foreground">건</span></div>
                    </div>
                    <div className="bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center justify-center">
                        <span className="text-primary font-bold">전체 통계 보기 →</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
                    {/* ================= 강좌 승인 ================= */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-8 bg-primary rounded-full" />
                                강좌 개설 승인
                            </h2>
                            <Badge variant="outline" className="text-xs">{course.filter(c => c.proposalStatus === 'PENDING').length}건 대기중</Badge>
                        </div>
                        <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="text-center w-[80px]">ID</TableHead>
                                        <TableHead className="text-center">강좌명</TableHead>
                                        <TableHead className="text-center w-[100px]">강사</TableHead>
                                        <TableHead className="text-center w-[80px]">상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course && course.length > 0 ? (
                                        course.slice(0, 5).map((item, index) => {
                                            const uniqueKey = item.courseId || `course-idx-${index}`;
                                            return (
                                                <TableRow key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                                                        {item.courseId}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link to={`/admin/course/${item.courseId}`} className="font-medium hover:text-primary transition-colors block truncate max-w-[200px]">
                                                            {item.title}
                                                            {isNewCourse(item.createdAt) && (
                                                                <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full ml-1.5 align-middle mb-0.5" />
                                                            )}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-center text-sm">{item.instructorName}</TableCell>
                                                    <TableCell className="text-center">
                                                        {item.proposalStatus === 'PENDING' ? (
                                                            <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">대기</Badge>
                                                        ) : item.proposalStatus === 'APPROVED' ? (
                                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">승인</Badge>
                                                        ) : (
                                                            <Badge variant="outline">반려</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                대기 중인 강좌가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* ================= 강사 승인 ================= */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <span className="w-2 h-8 bg-purple-500 rounded-full" />
                                신규 강사 승인
                            </h2>
                            <Badge variant="outline" className="text-xs">{status.filter(u => u.status === 'SUSPENDED' && u.profileStatus !== 'REJECTED').length}명 대기중</Badge>
                        </div>
                        <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="text-center w-[80px]">ID</TableHead>
                                        <TableHead className="text-center">강사명</TableHead>
                                        <TableHead className="text-center w-[100px]">상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {status && status.length > 0 ? (
                                        status.filter(users => users.status === 'SUSPENDED' && users.profileStatus !== 'REJECTED').slice(0, 5).map((users, index) => {
                                            const uniqueKey = users.userId || `user-idx-${index}`;
                                            return (
                                                <TableRow key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                                    <TableCell className="text-center font-mono text-xs text-muted-foreground">{users.userId}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Link to={`/admin/users/instructors/${users.userId}`} className="font-medium hover:underline hover:text-primary">
                                                            {users.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">승인 필요</Badge>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                                승인 대기 중인 강사가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>

                {/* 강의 승인란 */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-8 bg-indigo-500 rounded-full" />
                            강의 업로드 승인
                        </h2>
                        <Badge variant="outline" className="text-xs">{lecture.filter(l => l.approvalStatus === 'PENDING').length}건 대기중</Badge>
                    </div>
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="text-center w-[60px]">No</TableHead>
                                    <TableHead className="text-center w-[80px]">순서</TableHead>
                                    <TableHead className="text-left">강의 제목</TableHead>
                                    <TableHead className="text-center w-[120px]">강사명</TableHead>
                                    <TableHead className="text-center w-[150px]">업로드 일정</TableHead>
                                    <TableHead className="text-center w-[100px]">상태</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lecture && lecture.length > 0 ? (
                                    lecture.slice(0, 8).map((item, index) => {
                                        const uniqueKey = item.lectureId || `lecture-idx-${index}`;
                                        return (
                                            <TableRow key={uniqueKey} className="hover:bg-muted/30 transition-colors">
                                                <TableCell className="text-center font-mono text-xs text-muted-foreground">{item.lectureId}</TableCell>
                                                <TableCell className="text-center font-bold text-muted-foreground">{item.orderNo}강</TableCell>
                                                <TableCell>
                                                    <Link to={`/admin/lectures/${item.lectureId}`} className="font-medium hover:text-primary transition-colors block truncate max-w-[300px]">
                                                        {item.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="text-center text-sm">{item.createdByName}</TableCell>
                                                <TableCell className="text-center text-xs text-muted-foreground">{item.scheduledAt}</TableCell>
                                                <TableCell className="text-center">
                                                    {item.approvalStatus === 'PENDING' ? (
                                                        <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">대기</Badge>
                                                    ) : item.approvalStatus === 'APPROVED' ? (
                                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">승인</Badge>
                                                    ) : (
                                                        <Badge variant="outline">반려</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                            업로드된 강의가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
            <Tail />
        </>
    );

}

export default AdminMain;
