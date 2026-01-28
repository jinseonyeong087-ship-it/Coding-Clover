import React, { useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import Nav from '@/components/Nav';
import Tail from '@/components/Tail'

function FindAccount() {
    return (
        <>

        <Nav />
        <p>계정 찾기 페이지</p>
        <Tail />
        
        </>
    )
}

export default FindAccount;