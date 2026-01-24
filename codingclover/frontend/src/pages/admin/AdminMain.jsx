import React, { useState, useEffect } from "react";
import AdminNav from "@/components/AdminNav";
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
import { Badge } from "@/components/ui/badge"
import axios from "axios";


function AdminMain() {

    /**id, 난이도, 강좌명, 강사명, 승인상태 */
    const [course, setCourse] = useState([]);

    useEffect(() => {
        axios.get('/admin/course', { withCredentials: true })
            .then((response) => {
                const resData = response.data;
                if (Array.isArray(resData)) {
                    setCourse(resData);
                    console.log("데이터 로드 성공", response.data);
                } else if (resData && typeof resData === 'object') {
                    // 혹시 모르니 객체 내부의 배열 필드 확인 (보통 content나 list라는 이름으로 옴)
                    const list = resData.content || resData.list || [resData];
                    setCourse(Array.isArray(list) ? list : [list]);
                }
            })
            .catch((err) => {
                console.error('데이터 로딩 실패', err);
            })
    }, []);


    // 'PENDING'=보류, 'APPROVED'=생존, 'REJECTED'=탈락

    // 강좌 승인 백엔파일을 찾아라

    return (
        <>
            <AdminNav />
            <section className="container mx-auto px-4 py-16">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>생성번호</TableHead>
                            <TableHead>강좌명</TableHead>
                            <TableHead>난이도</TableHead>
                            <TableHead>승인상태</TableHead>
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
                                        <TableCell>{item.courseId}</TableCell>
                                        <TableCell>
                                            <Link to={`/admin/course/${item.courseId}`} className="hover:underline">
                                                {item.title}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            {item.level === 1 ? "초급" : item.level === 2 ? "중급" : "고급"}
                                        </TableCell>
                                        <TableCell>
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
            </section>
            <Tail />
        </>
    )
}

export default AdminMain;