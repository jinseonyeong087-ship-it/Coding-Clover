import React, { useState } from 'react';
import StudentNav from '@/components/StudentNav';
import Tail from '@/components/Tail';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { ArrowRight, BookOpen, PlayCircle } from "lucide-react";

function Basic() {

  let course = [
    {basic: "값"}, 
    {intermediate: "값"}, 
    {advanced: "값"}
  ]

  return (
    <>
      <StudentNav />
      <section className="container mx-auto px-4 py-16">
        <Tabs>
          <div className='flex items-center gap-10'>
            course.map((courses) => {
              return (
                <h2 className="text-2xl font-bold mb-6">{courses.label}</h2>

                <TabsList className="mb-6">
                  <TabsTrigger value={courses.id}>{courses.label}</TabsTrigger>
                </TabsList>
              )
            })
          </div>
          course.map(function() {
            return (
              <TabsContent value={grade.id}>
                <div className="grid coursesrid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* 이것도 맵 */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{courses.title}</CardTitle>
                      <CardDescription>{grade.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{grade.created_at}</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm" className="w-full">
                        <Link to="/student/courses/courseId/lectures" variant="outline" size="sm" className="w-full flex items-center justify-center">
                          자세히 보기 <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                        {/* 링크 수정 필요함 */}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </TabsContent>
            )})
        </Tabs >
      </section>
      <Tail />
    </>

  )
}

export default Basic;