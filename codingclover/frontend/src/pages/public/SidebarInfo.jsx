function SidebarInfo() {
    return (
        <div className="w-80 border-r border-border overflow-y-auto bg-white">
            <div className="p-4 border-b border-border">
                <h2 className="font-bold text-lg text-gray-800">강의 목록</h2>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-500">{lectures.length}개의 강의</p>
                    <span className="text-xs text-primary font-bold">
                        {Object.values(progressMap).filter(p => p.completedYn).length}/{lectures.length} 완료
                    </span>
                </div>
                {/* 전체 진도율 바 */}
                <div className="mt-2 h-1.5 w-full bg-gray-100 overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                            width: lectures.length > 0
                                ? `${Math.round((Object.values(progressMap).filter(p => p.completedYn).length / lectures.length) * 100)}%`
                                : '0%'
                        }}
                    />
                </div>
            </div>
            <div className="flex flex-col">
                {lectures.map((lec) => {
                    const isCompleted = progressMap[lec.lectureId]?.completedYn;
                    return (
                        <button
                            key={lec.lectureId}
                            onClick={() => handleSelectLecture(lec)}
                            className={`flex items-center gap-3 p-4 text-left transition-colors border-b border-gray-50 ${selectedLecture?.lectureId === lec.lectureId
                                    ? "bg-blue-50/50 border-l-4 border-l-primary"
                                    : "hover:bg-gray-50 border-l-4 border-l-transparent"
                                }`}
                        >
                            <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center text-xs font-bold border ${isCompleted
                                    ? "bg-primary border-primary text-white"
                                    : selectedLecture?.lectureId === lec.lectureId
                                        ? "bg-white border-primary text-primary"
                                        : "bg-gray-50 border-gray-300 text-gray-500"
                                }`}>
                                {isCompleted ? <CheckCircle className="w-3.5 h-3.5" /> : lec.orderNo}
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className={`text-sm font-medium truncate ${selectedLecture?.lectureId === lec.lectureId
                                        ? "text-primary"
                                        : isCompleted ? "text-gray-500 line-through decoration-gray-300" : "text-gray-700"
                                    }`}>
                                    {lec.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {lec.duration && (
                                        <span className="text-xs text-gray-400">
                                            {formatDuration(lec.duration)}
                                        </span>
                                    )}
                                    {isCompleted && (
                                        <span className="text-xs text-primary font-semibold">완료</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
                {lectures.length === 0 && (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        등록된 강의가 없습니다.
                    </div>
                )}
            </div>
        </div>
    )
}