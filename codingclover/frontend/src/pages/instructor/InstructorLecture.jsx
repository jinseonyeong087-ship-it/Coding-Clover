import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function InstructorLecture() {
    const { courseId } = useParams();
    const [courseInfo, setCourseInfo] = useState(null);
    const [lectureList, setLectureList] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingLectureId, setEditingLectureId] = useState(null);

    // 신규 강의 추가용 폼 데이터
    const [formData, setFormData] = useState({
        title: '',
        orderNo: '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE',
        scheduledAt: '',
    });

    // 수정/재심사용 폼 데이터
    const [editFormData, setEditFormData] = useState({
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

    // 강의 목록 가져오기
    const fetchLectures = () => {
        fetch(`/instructor/course/${courseId}/lectures`, {
            method: 'GET',
            credentials: 'include'
        })
            .then((res) => {
                if (!res.ok) throw new Error('강의 목록 조회 실패');
                return res.json();
            })
            .then((data) => setLectureList(data))
            .catch(err => console.error('강의 목록 조회 실패:', err));
    };

    useEffect(() => {
        fetchLectures();
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
            fetchLectures();
        } catch (err) {
            console.error(err);
            alert('강의 추가에 실패했습니다.');
        }
    };

    // 수정 모드 시작
    const handleEditStart = (lecture) => {
        setEditingLectureId(lecture.lectureId);
        setEditFormData({
            title: lecture.title,
            orderNo: lecture.orderNo,
            videoUrl: lecture.videoUrl,
            duration: lecture.duration,
            uploadType: lecture.uploadType || 'IMMEDIATE',
            scheduledAt: lecture.scheduledAt || '',
        });
    };

    // 수정 취소
    const handleEditCancel = () => {
        setEditingLectureId(null);
        setEditFormData({
            title: '',
            orderNo: '',
            videoUrl: '',
            duration: '',
            uploadType: 'IMMEDIATE',
            scheduledAt: '',
        });
    };

    // 반려된 강의 수정 후 재심사 요청 (REJECTED -> PENDING)
    const handleResubmit = async (lectureId) => {
        const resubmitData = {
            courseId: Number(courseId),
            title: editFormData.title,
            orderNo: Number(editFormData.orderNo),
            videoUrl: editFormData.videoUrl,
            duration: Number(editFormData.duration),
            uploadType: editFormData.uploadType,
            scheduledAt: editFormData.uploadType === 'RESERVED' ? editFormData.scheduledAt : null
        };

        try {
            const res = await fetch(`/instructor/lecture/${lectureId}/resubmit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(resubmitData)
            });
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            alert("재심사 요청이 완료되었습니다.");
            setEditingLectureId(null);
            fetchLectures();
        } catch (error) {
            console.error('재심사 요청 실패', error);
            alert("재심사 요청에 실패했습니다.");
        }
    };

    // 승인 상태 뱃지
    const getStatusBadge = (status) => {
        switch (status) {
            case 'APPROVED':
                return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">승인</span>;
            case 'REJECTED':
                return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">반려</span>;
            default:
                return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">대기</span>;
        }
    };

    // 재생시간 포맷 (초 -> 분:초)
    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                    {courseInfo ? `${courseInfo.title} - 강의 목록` : '강의 목록'}
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

            {/* 강의 목록 아코디언 */}
            {lectureList.length > 0 ? (
                <Accordion type="single" collapsible className="w-full">
                    {lectureList.map((lecture) => (
                        <AccordionItem key={lecture.lectureId} value={`lecture-${lecture.lectureId}`}>
                            <AccordionTrigger className="hover:no-underline">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium">{lecture.orderNo}강. {lecture.title}</span>
                                    {getStatusBadge(lecture.approvalStatus)}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {editingLectureId === lecture.lectureId ? (
                                    /* 수정 모드 */
                                    <div className="space-y-3 p-2">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">강의 제목</label>
                                            <Input
                                                value={editFormData.title}
                                                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">강의 순서</label>
                                            <Input
                                                type="number"
                                                value={editFormData.orderNo}
                                                onChange={(e) => setEditFormData({ ...editFormData, orderNo: e.target.value })}
                                                min={1}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">영상 URL</label>
                                            <Input
                                                value={editFormData.videoUrl}
                                                onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">재생 시간 (초)</label>
                                            <Input
                                                type="number"
                                                value={editFormData.duration}
                                                onChange={(e) => setEditFormData({ ...editFormData, duration: e.target.value })}
                                                min={0}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button onClick={() => handleResubmit(lecture.lectureId)}>
                                                {lecture.approvalStatus === 'REJECTED' ? '재심사 요청' : '저장'}
                                            </Button>
                                            <Button variant="outline" onClick={handleEditCancel}>취소</Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* 조회 모드 */
                                    <div className="space-y-2 p-2">
                                        <p><span className="font-semibold">재생 시간:</span> {formatDuration(lecture.duration)}</p>
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
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            ) : (
                <p className="text-gray-500 text-center py-8">등록된 강의가 없습니다.</p>
            )}
        </div>
    );
}

export default InstructorLecture;
