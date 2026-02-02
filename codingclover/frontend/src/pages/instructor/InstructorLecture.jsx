import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function InstructorLecture() {
    const { courseId } = useParams();
    const [courseInfo, setCourseInfo] = useState(null);
    const [isAdding, setIsAdding] = useState(false);

    // 신규 강의 추가용 폼 데이터
    const [formData, setFormData] = useState({
        title: '',
        orderNo: '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE',
        scheduledAt: '',
    });

    // 해당 강좌 정보 가져오기
    useEffect(() => {
        fetch(`/instructor/course/${courseId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        })
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
            .then((data) => setCourseInfo(data))
            .catch((error) => console.error(error.message));
    }, [courseId]);

    // 새로운 강의 추가
    const handleAddLecture = async () => {
        const addData = {
            courseId: Number(courseId),
            title: formData.title,
            orderNo: Number(formData.orderNo),
            videoUrl: formData.videoUrl,
            duration: Number(formData.duration),
            uploadType: formData.uploadType,
            scheduledAt: formData.uploadType === 'RESERVED' ? formData.scheduledAt : null
        };

        try {
            const res = await fetch(`/instructor/lecture/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(addData)
            });
            if (!res.ok) throw new Error('강의 추가 실패');
            alert('강의가 추가되었습니다.');
            setFormData({
                title: '',
                orderNo: '',
                videoUrl: '',
                duration: '',
                uploadType: 'IMMEDIATE',
                scheduledAt: '',
            });
            setIsAdding(false);
        } catch (err) {
            console.error(err);
            alert('강의 추가에 실패했습니다.');
        }
    };

    return (
        <div className="container mx-auto">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {courseInfo ? `${courseInfo.title} - 강의 추가` : '강의 추가'}
                </h2>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? '취소' : '강의 추가'}
                </Button>
            </div>

            {/* 강의 추가 폼 */}
            {isAdding && (
                <div className="mb-6 p-4 border rounded-md bg-slate-50 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">강좌명</label>
                        <Input
                            value={courseInfo?.title || ''}
                            placeholder="강좌명"
                            readOnly
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 제목</label>
                        <Input
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="강의 제목을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 순서</label>
                        <Input
                            type="number"
                            value={formData.orderNo}
                            onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                            min={1}
                            placeholder="강의 순서를 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">영상 URL</label>
                        <Input
                            value={formData.videoUrl}
                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                            placeholder="영상 URL을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">재생 시간 (초)</label>
                        <Input
                            type="number"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            min={0}
                            placeholder="재생 시간을 입력하세요"
                        />
                    </div>
                    <Button onClick={handleAddLecture}>추가하기</Button>
                    <Button onClick={handleAddLecture}>등록 예약</Button>
                </div>
            )}

        </div>
    );
}

export default InstructorLecture;
