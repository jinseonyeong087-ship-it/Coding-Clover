function Tail() {
    return (
        <footer className="w-full py-10 mt-12 border-t border-border bg-gray-50 text-gray-600 sticky bottom-0">
            <div className="container mx-auto px-6 max-w-screen-lg text-center">
                <div className="mb-4">
                    <h5 className="text-lg font-bold text-gray-800 mb-2">사단법인 네잎 클로버</h5>
                    <div className="text-sm space-y-1 text-gray-500">
                        <p>대표자 박나혜 | 사업자 등록번호 000-00-00000</p>
                        <p>주소 대구광역시 동구 동대구로 566</p>
                    </div>
                </div>
                <hr className="my-6 border-gray-200" />
                <div className="text-sm text-gray-500">
                    <span className="font-medium">&copy;2026 Coding-Clover All rights reserved.</span>
                    <span className="mx-2">|</span>
                    <a href="#" className="hover:text-primary transition-colors">이용약관</a>
                    <span className="mx-2">|</span>
                    <a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a>
                </div>
            </div>
        </footer>
    );
}

export default Tail;
