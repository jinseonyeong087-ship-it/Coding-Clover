import React from 'react';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';

function Noroll() {
    return (
        <>
            <StudentNav />
            <p className='text-center item-center'>권한 없음</p>
            <Tail />
        </>
    );
}

export default Noroll;