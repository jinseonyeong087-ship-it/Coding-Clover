import React from 'react';
import Nav from '@/components/Nav';
import Tail from '@/components/Tail';

function Noroll() {
    return (
        <>
            <Nav />
            <div className='py-24'/>
            <p className='text-center item-center'>권한 없음</p>
            <Tail />
        </>
    );
}

export default Noroll;