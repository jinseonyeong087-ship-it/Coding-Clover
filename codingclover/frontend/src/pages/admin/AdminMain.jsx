import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link } from "react-router-dom";
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
        fetch('/admin/course', {
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

        // 강의 업로드
        fetch('/admin/lectures', {
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
                console.log("강의 데이터 로드 성공", data);
                setLecture(data);
            })
            .catch((error) => {
                console.error('강의 데이터 로딩 실패', error);
            });
    }, []);

    //강의 불러오기


    return (
        <>
            <Nav />
            <section className="container mx-auto px-4 py-16">
                <div className="flex justify-between col-2 gap-8">

                    {/* ================= 강좌 승인 ================= */}
                    <div className="flex-1">
                        <Card>
                            <Table>
                                <TableCaption className="text-left text-foreground font-semibold text-lg caption-top px-4">강좌 개설 승인</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-3 text-center">생성번호</TableHead>
                                        <TableHead className="px-4 py-3 text-center">강좌명</TableHead>
                                        <TableHead className="px-4 py-3 text-center">강사명</TableHead>
                                        <TableHead className="px-4 py-3 text-center">난이도</TableHead>
                                        <TableHead className="px-4 py-3 text-center">승인상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {course && course.length > 0 ? (
                                        course.map((item, index) => {
                                            // 1. 서버 엔티티 필드명인 courseId를 사용하여 key 설정
                                            // 2. 만약 courseId가 없다면 index를 조합하여 유니크한 키 생성
                                            const uniqueKey = item.courseId || `course-idx-${index}`;

                                            return (
                                                <TableRow key={uniqueKey}>
                                                    {/* 3. Java 필드명인 courseId, title, level, proposalStatus 사용 */}
                                                    <TableCell className="px-4 py-3 text-center">
                                                        {item.courseId}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-center">
                                                        <Link
                                                            to={`/admin/course/${item.courseId}`}
                                                            className="hover:underline inline-flex items-center gap-2"
                                                        >
                                                            {item.title}

                                                            {/* 생성 후 24시간 이내 강좌 NEW 표시 */}
                                                            {isNewCourse(item.createdAt) && (
                                                                <span
                                                                    className="
                                                                        inline-flex items-center justify-center
                                                                        w-3.5 h-3.5 ml-1
                                                                        text-[10px] font-bold leading-none
                                                                        text-white bg-red-400
                                                                        rounded-full
                                                                        "
                                                                >
                                                                    N
                                                                </span>
                                                            )}
                                                        </Link>
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-center">
                                                        {item.instructorName}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-center">
                                                        {item.level === 1
                                                            ? "초급"
                                                            : item.level === 2
                                                                ? "중급"
                                                                : "고급"}
                                                    </TableCell>

                                                    <TableCell className="px-4 py-3 text-center">
                                                        {item.proposalStatus === 'PENDING' ? (
                                                            <Badge variant="destructive">승인 필요</Badge>
                                                        ) : item.proposalStatus === 'APPROVED' ? (
                                                            <Badge variant="secondary">승인 완료</Badge>
                                                        ) : (
                                                            <Badge variant="outline">반려됨</Badge>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-10">
                                                표시할 강좌 데이터가 없습니다.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>

                    {/* ================= 강사 승인 ================= */}
                    <div className="flex-1">
                        <Card>
                            <Table>
                                <TableCaption className="text-left text-foreground font-semibold text-lg caption-top px-4">신규강사</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="px-4 py-3 text-center">가입번호</TableHead>
                                        <TableHead className="px-4 py-3 text-center">강사명</TableHead>
                                        <TableHead className="px-4 py-3 text-center">승인상태</TableHead>
                                    </TableRow>
                                </TableHeader>
                                {/* id, 강사명, 승인상태  */}
                                <TableBody>
                                    {status && status.length > 0 ? (
                                        status.map((users, index) => {
                                            const uniqueKey = users.userId || `user-idx-${index}`;
                                            return (
                                                <TableRow key={uniqueKey}>
                                                    <TableCell className="px-4 py-3 text-center">{users.userId}</TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        <Link to={`/admin/users/instructors/${users.userId}`} className="hover:underline">
                                                            {users.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="px-4 py-3 text-center">
                                                        {users.status === 'ACTIVE' ? (
                                                            <Badge variant="secondary">승인 완료</Badge>
                                                        ) : users.status === 'SUSPENDED' ? (
                                                            <Badge variant="destructive">승인 필요</Badge>
                                                        ) : null}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center py-10">
                                                승인할 강사가 없습니다.
                                            </TableCell>
                                        </TableRow>)}
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
            </section>
            {/* 강의 승인란 */}
            <section className="container mx-auto px-4 py-16">
                <Card>
                    <Table>
                        <TableCaption className="text-left text-foreground font-semibold text-lg caption-top px-4">강의 업로드 사항</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="px-4 py-3 text-center">순서</TableHead>
                                <TableHead className="px-4 py-3 text-center">강좌명</TableHead>
                                <TableHead className="px-4 py-3 text-center">강의 제목</TableHead>
                                <TableHead className="px-4 py-3 text-center">난이도</TableHead>
                                <TableHead className="px-4 py-3 text-center">강사명</TableHead>
                                <TableHead className="px-4 py-3 text-center">승인 상태</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lecture && lecture.length > 0 ? (
                                lecture.map((item, index) => {
                                    const uniqueKey = item.lectureId || `lecture-idx-${index}`;
                                    return (
                                        <TableRow key={uniqueKey}>
                                            <TableCell className="px-4 py-3 text-center">{item.orderNo}</TableCell>
                                            <TableCell className="px-4 py-3 text-center"><Link to={`/admin/course/${item.courseId}`}>{item.courseTitle}</Link></TableCell>
                                            <TableCell className="px-4 py-3 text-center"><Link to={`/admin/course/${item.courseId}/lectures`}>{item.title}</Link></TableCell>
                                            <TableCell className="px-4 py-3 text-center">{item.duration}</TableCell>
                                            <TableCell className="px-4 py-3 text-center">{item.createdByName}</TableCell>
                                            <TableCell className="px-4 py-3 text-center">
                                                {item.approvalStatus === 'PENDING' ? (
                                                    <Badge variant="destructive">승인 필요</Badge>
                                                ) : item.approvalStatus === 'APPROVED' ? (
                                                    <Badge variant="secondary">승인 완료</Badge>
                                                ) : (
                                                    <Badge variant="outline">반려됨</Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10">
                                        업로드된 강의가 없습니다.
                                    </TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                </Card>
            </section>
            <Tail />
        </>
    );
}

export default AdminMain;
