function Tail() {
    const footerStyle = {
        backgroundColor: '#f8f9fa',
        padding: '40px 0',
        marginTop: '50px',
        borderTop: '1px solid #dee2e6',
        color: '#2c2c2c'
    };

    return (
        <footer className="text-center text-muted" style={footerStyle}>
            <div className="max-w-screen-lg mx-auto px-4">
                <div className="row">
                    <div className="col-md-12">
                        <h5 className="fw-bold text-dark mb-3">사단법인 네잎 클로버</h5>
                        <p className="mb-1">대표자 박나혜 | 사업자 등록번호 000-00-00000</p>
                        <p className="mb-3">주소 대구광역시 동구 동대구로 566</p>
                        <hr />
                        <p className="small">
                            &copy;2026 Coding-Clover All rights reserved. |{' '}
                            <a href="#" className="text-decoration-none">
                                이용약관
                            </a>{' '}
                            |{' '}
                            <a href="#" className="text-decoration-none">
                                개인정보처리방침
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Tail;
