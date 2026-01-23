import StudentNav from '@/components/StudentNav';
import React, { useState } from 'react';

function Noroll() {
    <>
    <StudentNav />
    <p>권한 없음</p>
    <Tail />
    </>
}

export default Noroll;