import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

function getYoutubeEmbedUrl(url) {
    if (!url) return null;
    // https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([\w-]+)/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    // https://youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([\w-]+)/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    return null;
}

function getStatusBadge(status) {
    switch (status) {
        case 'APPROVED':
            return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">승인</span>;
        case 'REJECTED':
            return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">반려</span>;
        default:
            return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">대기</span>;
    }
}

function LectureDetail({ lecture: lectureProp, onLectureUpdated }) {
    const { lectureId } = useParams();
    const [lecture, setLecture] = useState(lectureProp || null);
    const [loading, setLoading] = useState(!lectureProp && !!lectureId);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', videoUrl: '', duration: '' });
    const [durationLoading, setDurationLoading] = useState(false);
    const debounceTimer = useRef(null);
    const isStandalone = !lectureProp && !!lectureId;

    const isEditable = lecture && (lecture.approvalStatus === 'REJECTED' || lecture.approvalStatus === 'PENDING');

    useEffect(() => {
        if (isStandalone) {
            fetch(`/instructor/lecture/${lectureId}`, { credentials: 'include' })
                .then(res => {
                    if (!res.ok) throw new Error(res.statusText);
                    return res.json();
                })
                .then(data => setLecture(data))
                .catch(err => console.error('강의 조회 실패:', err))
                .finally(() => setLoading(false));
        }
    }, [lectureId, isStandalone]);

    useEffect(() => {
        if (lectureProp) setLecture(lectureProp);
    }, [lectureProp]);

    // 수정 모드 진입 시 현재 값으로 폼 초기화
    const startEditing = () => {
        setEditForm({
            title: lecture.title || '',
            videoUrl: lecture.videoUrl || '',
            duration: lecture.duration || '',
        });
        setIsEditing(true);
    };

    // 유튜브 URL인지 확인
    const isYoutubeUrl = (url) => /(?:youtube\.com|youtu\.be)/.test(url);

    // 유튜브 재생 시간 자동 조회
    const fetchDuration = async (url) => {
        if (!url || !isYoutubeUrl(url)) return;
        setDurationLoading(true);
        try {
            const res = await fetch(`/api/youtube/duration?url=${encodeURIComponent(url)}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const seconds = await res.json();
                if (seconds > 0) {
                    setEditForm(prev => ({ ...prev, duration: seconds }));
                }
            }
        } catch (err) {
            console.error('재생 시간 자동 조회 실패', err);
        } finally {
            setDurationLoading(false);
        }
    };

    // 영상 URL 변경 핸들러 (디바운스)
    const handleVideoUrlChange = (e) => {
        const url = e.target.value;
        setEditForm(prev => ({ ...prev, videoUrl: url }));
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => fetchDuration(url), 800);
    };

    // 수정 저장 (기존 resubmit 엔드포인트 활용)
    const handleSave = async () => {
        try {
            const res = await fetch(`/instructor/lecture/${lecture.lectureId}/resubmit`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    courseId: lecture.courseId,
                    title: editForm.title,
                    orderNo: lecture.orderNo,
                    videoUrl: editForm.videoUrl,
                    duration: Number(editForm.duration),
                    uploadType: lecture.uploadType || 'IMMEDIATE',
                    scheduledAt: lecture.scheduledAt || null,
                }),
            });
            if (!res.ok) throw new Error('강의 수정 실패');
            // 수정된 데이터를 로컬 상태에 반영
            setLecture(prev => ({
                ...prev,
                title: editForm.title,
                videoUrl: editForm.videoUrl,
                duration: Number(editForm.duration),
                approvalStatus: 'PENDING',
                rejectReason: null,
            }));
            setIsEditing(false);
            alert('강의가 수정되었습니다.');
            if (onLectureUpdated) onLectureUpdated();
        } catch (err) {
            alert(err.message || '강의 수정에 실패했습니다.');
        }
    };

    if (loading) return <p className="text-center py-20">로딩 중...</p>;
    if (!lecture) return null;

    const embedUrl = getYoutubeEmbedUrl(lecture.videoUrl);

    const content = (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{lecture.orderNo}강. {lecture.title}</h2>
                    {getStatusBadge(lecture.approvalStatus)}
                </div>
                {isEditable && !isEditing && (
                    <Button size="sm" onClick={startEditing}>
                        {lecture.approvalStatus === 'REJECTED' ? '재심사 요청' : '수정하기'}
                    </Button>
                )}
            </div>

            {isEditing ? (
                <div className="p-4 border rounded-md bg-slate-50 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">강의 제목</label>
                        <Input
                            value={editForm.title}
                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="강의 제목을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">영상 URL</label>
                        <Input
                            value={editForm.videoUrl}
                            onChange={handleVideoUrlChange}
                            placeholder="유튜브 영상 URL을 입력하세요"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            재생 시간 (초) {durationLoading && <span className="text-blue-500 text-xs ml-1">불러오는 중...</span>}
                        </label>
                        <Input
                            type="number"
                            value={editForm.duration}
                            onChange={(e) => setEditForm(prev => ({ ...prev, duration: e.target.value }))}
                            min={0}
                            placeholder={durationLoading ? "자동 조회 중..." : "재생 시간을 입력하세요"}
                            readOnly={durationLoading}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={handleSave}>저장</Button>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
                    </div>
                </div>
            ) : (
                <>
                    {embedUrl ? (
                        <div className="aspect-video w-full">
                            <iframe
                                className="w-full h-full rounded-md"
                                src={embedUrl}
                                title={lecture.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ) : lecture.videoUrl ? (
                        <div className="aspect-video w-full bg-black rounded-md overflow-hidden">
                            <video
                                className="w-full h-full"
                                controls
                                src={lecture.videoUrl}
                            >
                                당신의 브라우저는 비디오 태그를 지원하지 않습니다.
                            </video>
                        </div>
                    ) : (
                        <div className="aspect-video w-full bg-slate-100 rounded-md flex items-center justify-center text-slate-400 flex-col gap-2">
                            <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z" /><rect width="14" height="12" x="2" y="6" rx="2" ry="2" /></svg>
                            </div>
                            <p className="text-sm font-medium">등록된 영상이 없습니다.</p>
                        </div>
                    )}
                </>
            )}



            {lecture.approvalStatus === 'REJECTED' && lecture.rejectReason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                    <h3 className="text-red-800 font-bold mb-2">반려 사유</h3>
                    <p className="text-red-700 whitespace-pre-wrap">{lecture.rejectReason}</p>
                </div>
            )}
        </div>
    );

    if (isStandalone) {
        return (
            <>
                <Nav />
                <section className="container mx-auto px-16 py-24">
                    {content}
                </section>
                <Tail />
            </>
        );
    }

    return content;
}

export default LectureDetail;
