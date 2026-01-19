import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import MainLogin from '../pages/MainLogin';
import Home from '../pages/Home';

function StudentNav() {
    const tabs = [
        { id: 'basic', label: '초급', icon: 'star' },
        { id: 'intermediate', label: '중급', icon: 'star-half' },
        { id: 'advanced', label: '고급', icon: 'star-fill' },
    ];

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold text-primary" onClick={() => { <Home /> }}>
                    <i className="bi bi-code-square"></i> Coding-Clover
                </Link>

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
                            <a className="nav-link dropdown-toggle" id="navbarDropdown" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">전체 강좌</a>
                            <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                                <li><a className="dropdown-item" href="#!">초급</a></li>
                                <li><a className="dropdown-item" href="#!">중급</a></li>
                                <li><a className="dropdown-item" href="#!">고급</a></li>
                            </ul>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" href="#">
                                <i className="bi bi-chat-dots"></i> Q&A
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" href="#">
                                <i className="bi bi-people"></i> 커뮤니티
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" href="#">
                                <i className="bi bi-megaphone"></i> 공지사항
                            </Link>
                        </li>
                    </ul>

                    <div className="d-flex">
                        <input type="search" style={{ width: '300px' }} />
                        <button className="btn btn-outline-secondary me-2" type="button">
                            <i className="bi bi-search"></i>
                        </button>
                        <Link className="btn btn-primary" onClick={() => { <MainLogin /> }}>
                            <i className="bi bi-box-arrow-in-right"></i>로그인
                        </Link>                    
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default StudentNav;
