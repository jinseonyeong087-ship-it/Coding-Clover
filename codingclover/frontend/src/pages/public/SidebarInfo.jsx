function SidebarInfo() {
    return (
            <div className="w-80 border-r border-slate-200 overflow-y-auto bg-white">
                    <div className="p-4 border-b border-slate-100">
                        <h2 className="font-bold text-lg text-slate-800">강의 목록</h2>
                        <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-slate-500">{lectures.length}개의 강의</p>
                            <span className="text-xs text-indigo-600 font-semibold">
                                {Object.values(progressMap).filter(p => p.completedYn).length}/{lectures.length} 완료
                            </span>
                        </div>
                        {/* 전체 진도율 바 */}
                        <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
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
                                    className={`flex items-center gap-3 p-4 text-left transition-colors border-b border-slate-50 ${
                                        selectedLecture?.lectureId === lec.lectureId
                                            ? "bg-indigo-50 border-l-4 border-l-indigo-500"
                                            : "hover:bg-slate-50 border-l-4 border-l-transparent"
                                    }`}
                                >
                                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        isCompleted
                                            ? "bg-emerald-500 text-white"
                                            : selectedLecture?.lectureId === lec.lectureId
                                                ? "bg-indigo-500 text-white"
                                                : "bg-slate-100 text-slate-600"
                                    }`}>
                                        {isCompleted ? <CheckCircle className="w-4 h-4" /> : lec.orderNo}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${
                                            selectedLecture?.lectureId === lec.lectureId
                                                ? "text-indigo-700"
                                                : isCompleted ? "text-slate-500" : "text-slate-700"
                                        }`}>
                                            {lec.title}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            {lec.duration && (
                                                <span className="text-xs text-slate-400">
                                                    {formatDuration(lec.duration)}
                                                </span>
                                            )}
                                            {isCompleted && (
                                                <span className="text-xs text-emerald-500 font-semibold">완료</span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                        {lectures.length === 0 && (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                등록된 강의가 없습니다.
                            </div>
                        )}
                    </div>
                </div>
    )
}