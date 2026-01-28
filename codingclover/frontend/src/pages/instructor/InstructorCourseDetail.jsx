import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import InstructorNav from "@/components/InstructorNav";
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/Button";

function InstructorCourseCreate() {

    const { courseId } = useParams();
    const [instructorStatus, setInstructorStatus] = useState(null);
    const [isEditing, setIsEditing] = useState(false);  // 수정 모드 여부
    const [formData, setFormData] = useState(initialData);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`/instructor/course/${courseId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'})
            .then((res) => {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('인증 필요: 강사로 로그인해주세요.');
                }
                if (res.status === 500) {
                    throw new Error('서버 에러: 해당 강좌가 존재하지 않거나 접근 권한이 없습니다.');
                }
                if (!res.ok) throw new Error(`에러 발생: ${res.status}`);
                return res.json();
            })
            .then((data) => setCourse(data))
            .catch((error) => console.error(error.message));
    }, [courseId]);

    // useEffect(() => {
    //     fetch('/instructor/me',
    //          method: 'GET', 
    //          headers: { 'Content-Type': 'application/json' },
    //          credentials: 'include')
    //         .then(res => res.json())
    //         .then(data => setInstructorStatus(data.status));
    // }, []);

    const handleEdit = () => {
        setIsEditing(true);  // 수정 모드 활성화
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return '승인 대기';
            case 'APPROVED': return '승인 완료';
            case 'REJECTED': return '반려';
            default: return status;
        }
    };

    const getLevelText = (level) => {
        switch (level) {
            case 1: return '초급';
            case 2: return '중급';
            case 3: return '고급';
            default: return level;
        }
    };

    if (!course) {
        return <div className="p-6">로딩 중...</div>;
    }

    return (
        <>
            <InstructorNav />
            {instructorStatus === 'SUSPENDED' ? (<p>마이페이지에서 강사이력을 추가해 주세요</p>) : (<section className="container mx-auto px-4 py-16">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">{formData.title}</h1>
                    <div>
                        {setIsEditing === true ? (
                            <Button size="sm" onClick={handleEdit}>저장하기</Button>
                        ) : (<Button size="sm" onClick={handleChange}>수정하기</Button>)}
                        <Button variant="outline" onClick={() => navigate('/instructor/dashboard')}>목록으로</Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <span className="font-semibold">난이도: </span>
                        {getLevelText(formData.level)}
                    </div>
                    <div>
                        <span className="font-semibold">가격: </span>
                        {formData.price?.toLocaleString()}원
                    </div>
                    <div>
                        <span className="font-semibold">설명: </span>
                        <p className="mt-2 bg-slate-50 p-4 rounded-md border">{formData.description}</p>
                    </div>
                    <div>
                        <span className="font-semibold">상태: </span>
                        {getStatusText(formData.proposalStatus)}
                    </div>
                    {formData.proposalStatus === 'REJECTED' && formData.proposalRejectReason && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                            <h3 className="text-red-800 font-bold mb-2">반려 사유 안내</h3>
                            <p className="text-red-700 whitespace-pre-wrap">
                                {formData.proposalRejectReason}
                            </p>
                        </div>
                    )}

                </div>
            </section>)}
            <Tail />
        </>
    );

}

export default InstructorCourseCreate;