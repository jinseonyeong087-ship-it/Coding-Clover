import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Nav from "@/components/Nav"
import Tail from "@/components/Tail"
import { Button } from "@/components/ui/button";

function AdminLectureDetail() {
    const { lectureId } = useParams();
    const [lecture, setLecture] = useState([])

    useEffect(()=>{
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
            <p>강의 업로드 승인페이지</p>
            <div className="space-y-2 p-2">
                <p><span className="font-semibold">재생 시간:</span> {lecture.duration}</p>
                <p><span className="font-semibold">영상 URL:</span> {lecture.videoUrl}</p>
                {lecture.approvalStatus === 'REJECTED' && lecture.rejectReason && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-700 text-sm">
                            <span className="font-semibold">반려 사유:</span> {lecture.rejectReason}
                        </p>
                    </div>
                )}
                <div className="flex gap-2 mt-3">
                    {lecture.approvalStatus === 'REJECTED' ? (
                        <Button onClick={() => handleEditStart(lecture)}>수정 후 재심사</Button>
                    ) : lecture.approvalStatus === 'PENDING' ? (
                        <Button onClick={() => handleEditStart(lecture)}>수정</Button>
                    ) : (
                        <Button disabled>승인완료</Button>
                    )}
                </div>
            </div>


            <Tail />
        </>
    )
}

export default AdminLectureDetail;