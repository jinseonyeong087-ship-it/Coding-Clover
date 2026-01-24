import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail'

function FindAccount() {
    return (
        <>

        <StudentNav />
        <p>계정 찾기 페이지</p>
        <Tail />
        
        </>
    )
}

export default FindAccount;