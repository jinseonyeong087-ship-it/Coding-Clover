import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";


function LectureUpload({ courseInfo, courseId: courseIdProp, nextOrderNo, onUploaded }) {
    const params = useParams();
    const courseId = courseIdProp || params.courseId;
    //  nextOrderNo prop → 강의 순서 자동 세팅
    //  onUploaded 콜백 → 업로드 성공 후 부모에게 알림 (없으면 기존처럼 navigate

    const navigate = useNavigate();
    const [durationLoading, setDurationLoading] = useState(false);
    const debounceTimer = useRef(null);
    const [existingLectures, setExistingLectures] = useState([]); // 기존 강의 목록 (orderNo, title)
    const MAX_ORDER = 20; // 드롭다운 최대 순서

    // 컴포넌트 마운트 시 기존 강의 목록 조회
    useEffect(() => {
        if (!courseId) return;
        fetch(`/instructor/course/${courseId}/lectures`, {
            credentials: 'include'
        })
            .then(res => res.ok ? res.json() : [])
            .then(data => setExistingLectures(data))
            .catch(() => setExistingLectures([]));
    }, [courseId]);

    // 신규 강의 추가용 폼 데이터
    const [formData, setFormData] = useState({
        title: '',
        orderNo: nextOrderNo || '',
        videoUrl: '',
        duration: '',
        uploadType: 'IMMEDIATE',
        scheduledAt: '',
    });

    // 초 → "n분 n초" 포맷
    const formatDuration = (totalSeconds) => {
        const sec = Number(totalSeconds);
        if (!sec || sec <= 0) return '';
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        if (m > 0 && s > 0) return `${m}분 ${s}초`;
        if (m > 0) return `${m}분`;
        return `${s}초`;
    };

    // 유튜브 URL인지 확인
    const isYoutubeUrl = (url) => {
        return /(?:youtube\.com|youtu\.be)/.test(url);
    };

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
                    setFormData(prev => ({ ...prev, duration: seconds }));
                }
            }
        } catch (err) {
            console.error('재생 시간 자동 조회 실패', err);
        } finally {
            setDurationLoading(false);
        }
    };

    // 영상 URL 변경 핸들러 (디바운스 적용)
    const handleVideoUrlChange = (e) => {
        const url = e.target.value;
        setFormData(prev => ({ ...prev, videoUrl: url }));

        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            fetchDuration(url);
        }, 800);
    };

    // 새로운 강의 추가
    const handleAddLecture = async () => {
        if (!formData.title.trim()) { alert('강의 제목을 입력해주세요.'); return; }
        if (!formData.orderNo) { alert('강의 순서를 선택해주세요.'); return; }
        if (!formData.videoUrl.trim()) { alert('영상 URL을 입력해주세요.'); return; }
        if (formData.uploadType === 'RESERVED' && !formData.scheduledAt) { alert('공개 예정일을 입력해주세요.'); return; }

        const addData = {
            courseId: Number(courseId),
            title: formData.title,
            orderNo: Number(formData.orderNo),
            videoUrl: formData.videoUrl,
            duration: Number(formData.duration),
            uploadType: formData.uploadType,
            scheduledAt: formData.uploadType === 'RESERVED' && formData.scheduledAt ? formData.scheduledAt : null
        };

        try {
            const res = await fetch(`/instructor/lecture/upload`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(addData)
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || '강의 추가 실패');
            }
            alert('강의 정보를 제출하였습니다. 승인 요청을 기다려주세요.');
            if (onUploaded) {
                onUploaded();
            }
            window.location.reload();
            setFormData({
                title: '',
                orderNo: '',
                videoUrl: '',
                duration: '',
                uploadType: 'IMMEDIATE',
                scheduledAt: '',
            });
        } catch (err) {
            alert(err.message || '강의 추가에 실패했습니다.');
        }
    };


    // 임시 저장 (POST /instructor/lecture/draft)
    const handleSaveDraft = async () => {
        if (!formData.title && !formData.videoUrl) {
            alert('최소한 강의 제목 또는 영상 URL을 입력해주세요.');
            return;
        }
        const draftData = {
            courseId: Number(courseId),
            title: formData.title || '',
            orderNo: formData.orderNo ? Number(formData.orderNo) : 0,
            videoUrl: formData.videoUrl || null,
            duration: formData.duration ? Number(formData.duration) : null,
            uploadType: formData.uploadType || 'IMMEDIATE',
            scheduledAt: formData.uploadType === 'RESERVED' ? formData.scheduledAt : null
        };
        try {
            const res = await fetch('/instructor/lecture/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(draftData)
            });
            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || '임시 저장 실패');
            }
            alert('임시 저장되었습니다.');
            if (onUploaded) onUploaded();
        } catch (err) {
            alert(err.message || '임시 저장에 실패했습니다.');
        }
    };

    // 강의 등록 예약 토글
    const handleBookLecture = () => {
        if (formData.uploadType === 'RESERVED') {
            setFormData({ ...formData, uploadType: 'IMMEDIATE', scheduledAt: '' });
        } else {
            setFormData({ ...formData, uploadType: 'RESERVED' });
        }
    }
    return (
        <>
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
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={formData.orderNo}
                        onChange={(e) => setFormData({ ...formData, orderNo: e.target.value })}
                    >
                        <option value="">순서를 선택하세요</option>
                        {Array.from({ length: MAX_ORDER }, (_, i) => i + 1).map(num => {
                            const existing = existingLectures.find(l => l.orderNo === num);
                            return (
                                <option key={num} value={num} disabled={!!existing}>
                                    {num}강 {existing ? `- ${existing.title} (등록됨)` : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">영상 URL</label>
                    <Input
                        value={formData.videoUrl}
                        onChange={handleVideoUrlChange}
                        placeholder="유튜브 영상 URL을 입력하세요"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">
                        재생 시간
                        {!durationLoading && formData.duration > 0 && (
                            <span className="text-green-600 text-xs ml-1">({formatDuration(formData.duration)})</span>
                        )}
                    </label>
                    <Input
                        type="number"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        min={0}
                        placeholder={durationLoading ? "자동 조회 중..." : "재생 시간을 입력하세요"}
                        readOnly={durationLoading}
                    />
                </div>
                {formData.uploadType === 'RESERVED' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">공개 예정일</label>
                        <Input
                            type="datetime-local"
                            value={formData.scheduledAt}
                            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                        />
                    </div>
                )}
                <div className="flex gap-2">
                    <Button onClick={handleAddLecture}>승인 요청</Button>
                    <Button variant="secondary" onClick={handleSaveDraft}>
                        임시 저장
                    </Button>
                    <Button
                        variant={formData.uploadType === 'RESERVED' ? 'destructive' : 'outline'}
                        onClick={handleBookLecture}
                    >
                        {formData.uploadType === 'RESERVED' ? '예약 취소' : '예약 업로드'}
                    </Button>
                </div>
            </div>
        </>


    );
}

export default LectureUpload;
