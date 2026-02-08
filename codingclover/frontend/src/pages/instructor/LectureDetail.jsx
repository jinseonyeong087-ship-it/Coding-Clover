import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from "@/components/Tail";

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

function LectureDetail({ lecture: lectureProp }) {
    const { lectureId } = useParams();
    const [lecture, setLecture] = useState(lectureProp || null);
    const [loading, setLoading] = useState(!lectureProp && !!lectureId);
    const isStandalone = !lectureProp && !!lectureId;

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

    if (loading) return <p className="text-center py-20">로딩 중...</p>;
    if (!lecture) return null;

    const embedUrl = getYoutubeEmbedUrl(lecture.videoUrl);

    const content = (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">{lecture.orderNo}강. {lecture.title}</h2>
                {getStatusBadge(lecture.approvalStatus)}
            </div>

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
                <p className="text-sm text-muted-foreground">영상 URL: {lecture.videoUrl}</p>
            ) : (
                <p className="text-sm text-muted-foreground">등록된 영상이 없습니다.</p>
            )}

            {lecture.approvalStatus === 'APPROVED' && (
                <p className="text-green-600 font-medium bg-green-50 p-3 rounded-md border border-green-200">
                    이 강의는 승인되어 수강생 화면에서 볼 수 있습니다.
                </p>
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
