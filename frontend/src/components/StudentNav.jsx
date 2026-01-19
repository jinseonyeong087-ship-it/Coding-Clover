import React from 'react';

function StudentNav() {
    const tabs = [
        { id: 'basic', label: '초급', icon: 'star' },
        { id: 'intermediate', label: '중급', icon: 'star-half' },
        { id: 'advanced', label: '고급', icon: 'star-fill' },
    ];

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container-fluid">
                <a className="navbar-brand fw-bold text-primary" href="#">
                    <i className="bi bi-code-square"></i> Coding-Clover
                </a>

                <button
                    className="navbar-toggler"
                    type="button"
                    // data-bs-toggle="collapse"
                    // data-bs-target="#navbarNav"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item dropdown">
                            <a
                                className="nav-link dropdown-toggle"
                                href="#"
                                role="button"
                                data-bs-toggle="dropdown"
                            >
                                레벨별 강좌
                            </a>
                            <ul className="dropdown-menu">
                                {tabs.map((tab) => (
                                    <li key={tab.id}>
                                        <a className="dropdown-item" href="#">
                                            <i className={`bi bi-${tab.icon}`}></i> {tab.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-chat-dots"></i> Q&A
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-people"></i> 커뮤니티
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#">
                                <i className="bi bi-megaphone"></i> 공지사항
                            </a>
                        </li>
                    </ul>

                    <div className="d-flex">
                        <input type="search" style={{ width: '300px' }} />
                        <button className="btn btn-outline-secondary me-2" type="button">
                            <i className="bi bi-search"></i>
                        </button>
                        <a href="#" className="btn btn-primary">
                            <i className="bi bi-box-arrow-in-right"></i> 로그아웃으로
                        </a>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default StudentNav;
