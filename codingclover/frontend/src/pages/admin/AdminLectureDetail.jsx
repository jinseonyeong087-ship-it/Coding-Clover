import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "@/components/Nav"
import Tail from "@/components/Tail"
import { Button } from "@/components/ui/button";

function AdminLectureDetail() {
    const { lectureId } = useParams();
    const [lecture, setLecture] = useState([])

    useEffect(() => {
        fetch(`/admin/lectures/${lectureId}`, {
            method: 'GET',
            credentials: 'include'
        }).then((res) => {
            if (!res.ok) throw new Error('강의 목록 조회 실패');
            return res.json();
        })
            .then((data) => setLecture(data))
            .catch(err => console.error('강의 목록 조회 실패:', err));
    }, [lectureId])

    return (
        <>
            <Nav />
            <section className="container mx-auto px-16 py-24">

                <p>강좌의 강의 리스트 는 사이드 메뉴</p>
                <p>우측 강의 상세페이지</p>


            </section>



            <Tail />
        </>
    )
}

export default AdminLectureDetail;