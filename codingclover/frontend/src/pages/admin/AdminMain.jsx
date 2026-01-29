import React, { useState, useEffect } from "react";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Link } from "react-router-dom";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
  Card,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"


function AdminMain() {

    /**id, 난이도, 강좌명, 강사명, 승인상태 */
    const [course, setCourse] = useState([]);
    const [status, setStatus] = useState([]);
    const [users, setUsers] = useState([]);

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
    }, []);



    // 'PENDING'=보류, 'APPROVED'=생존, 'REJECTED'=탈락

    // 강좌 승인 백엔파일을 찾아라

    return (
        <>
            <Nav />
            <section className="container mx-auto px-4 py-16">
                <div className="flex justify-between gap-8">
                    <div className="flex-1">
                        <Card>
                        <Table>
                            <TableHeader>
                                 <TableHead className="text-foreground font-semibold px-4 py-3">강좌 승인</TableHead>
                                <TableRow>
                                    <TableHead className="px-4 py-3 text-center">생성번호</TableHead>
                                    <TableHead className="px-4 py-3 text-center">강좌명</TableHead>
                                    <TableHead className="px-4 py-3 text-center">강사명</TableHead>
                                    <TableHead className="px-4 py-3 text-center">난이도</TableHead>
                                    <TableHead className="px-4 py-3 text-center">승인상태</TableHead>
                                </TableRow>
                            </TableHeader>
                            {/* id, 난이도, 강좌명, 강사명, 승인상태  */}
                            <TableBody>
                                {course && course.length > 0 ? (
                                    course.map((item, index) => {
                                        // 1. 서버 엔티티 필드명인 courseId를 사용하여 key 설정
                                        // 2. 만약 courseId가 없다면 index를 조합하여 유니크한 키 생성
                                        const uniqueKey = item.courseId || `course-idx-${index}`;

                                        return (
                                            <TableRow key={uniqueKey}>
                                                {/* 3. Java 필드명인 courseId, title, level, proposalStatus 사용 */}
                                                <TableCell className="px-4 py-3 text-center">{item.courseId}</TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    <Link to={`/admin/course/${item.courseId}/pending`} className="hover:underline">
                                                        {item.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    {/* <Link to={`/admin/course/${item.courseId}/pending`} className="hover:underline"> */}
                                                        {item.getInstructorName}
                                                    {/* </Link> */}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    {item.level === 1 ? "초급" : item.level === 2 ? "중급" : "고급"}
                                                </TableCell>
                                                <TableCell className="px-4 py-3 text-center">
                                                    {/* 4. DB ENUM 값인 PENDING 상태 확인 */}
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
                                        <TableCell colSpan={4} className="text-center py-10">
                                            표시할 강좌 데이터가 없습니다.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </Card>
                    </div>
                    <div className="flex-1">
                        <Card>
                        <Table>
                            <TableHeader>
                                <TableHead className="text-foreground font-semibold px-4 py-3">강사 승인</TableHead>
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
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        </Card>
                    </div>
                </div>

            </section>
            <Tail />
        </>
    )
}

export default AdminMain;