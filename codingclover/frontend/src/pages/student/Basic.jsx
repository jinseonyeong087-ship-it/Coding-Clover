import React, { useState } from 'react';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function Basic () {
    return (
        <>
        <StudentNav />
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {/* TODO: map함수로 서버에서 데이터 받아오기 */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">강좌명 (서버-디비)</CardTitle>
                  <CardDescription>초급 · 입문자 추천</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    강좌명 앞에 정의해주고 서버에서 디비받아오기
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    <Link to=''>자세히 보기 <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
        <Tail />
        </>
        
    )   
}

export default Basic;