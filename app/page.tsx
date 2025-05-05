"use client";

import Image from "next/image"
import Link from "next/link"
import { satoshi } from "./fonts"
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { getStudySessions } from "@/actions/studySchedule";
import { StudySessionType } from "@/actions/studySchedule";
import { getUserStatistics } from "@/actions/userStatistics";
import { useEffect, useState } from "react";
import { HeartIcon } from "lucide-react";
import { redirect } from "next/navigation";
export default function Home() {
    const { data: session } = authClient.useSession();
    if(!session) {
        redirect("/auth/sign-in");
    }
    const isPremium = session?.user && (session.user as any).premium === true;
    
    const [sessions, setSessions] = useState<StudySessionType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [stats, setStats] = useState({
        completedLections: 0,
        totalQuizzes: 0,
        averageAccuracy: 0,
        hearts: 5,
        maxHearts: 5,
        timeUntilNextHeart: null as number | null,
        loading: true
    });
    
    // Timer for heart countdown
    const [countdown, setCountdown] = useState<string>("");

    // Fetch study sessions on component mount
    useEffect(() => {
      const fetchSessions = async () => {
        setLoading(true);
        try {
          const data = await getStudySessions();
          
          if (data) {
            setSessions(data);
          } else {
            setError("Failed to fetch study sessions");
          }
        } catch (err) {
          setError("Error loading study sessions");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchSessions();
    }, []);
    
    // Fetch user statistics
    useEffect(() => {
      const fetchStats = async () => {
        try {
          const userStats = await getUserStatistics();
          console.log(userStats)
          if (userStats) {
            setStats({
              completedLections: userStats.completedLections,
              totalQuizzes: userStats.totalQuizzes,
              averageAccuracy: userStats.averageAccuracy,
              hearts: userStats.hearts,
              maxHearts: userStats.maxHearts,
              timeUntilNextHeart: userStats.timeUntilNextHeart,
              loading: false
            });
          } else {
            setStats(prev => ({ ...prev, loading: false }));
          }
        } catch (err) {
          console.error("Error loading user statistics:", err);
          setStats(prev => ({ ...prev, loading: false }));
        }
      };

      fetchStats();
      
      // Refresh stats every minute to update heart regeneration
      const intervalId = setInterval(fetchStats, 60000);
      return () => clearInterval(intervalId);
    }, []);
    
    // Format countdown timer for hearts
    useEffect(() => {
      if (stats.timeUntilNextHeart === null) {
        setCountdown("");
        return;
      }
      
      let remaining = stats.timeUntilNextHeart;
      
      const timer = setInterval(() => {
        if (remaining <= 0) {
          clearInterval(timer);
          // Refresh stats when timer completes
          const fetchStats = async () => {
            const userStats = await getUserStatistics();
            if (userStats) {
              setStats({
                completedLections: userStats.completedLections,
                totalQuizzes: userStats.totalQuizzes,
                averageAccuracy: userStats.averageAccuracy,
                hearts: userStats.hearts,
                maxHearts: userStats.maxHearts,
                timeUntilNextHeart: userStats.timeUntilNextHeart,
                loading: false
              });
            }
          };
          
          fetchStats();
          return;
        }
        
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        remaining -= 1;
      }, 1000);
      
      return () => clearInterval(timer);
    }, [stats.timeUntilNextHeart]);

    // Format date for display
    const formatSessionDate = (date: Date) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const sessionDate = new Date(date);
      
      // Check if it's today
      if (sessionDate.toDateString() === today.toDateString()) {
        return `Today, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Check if it's tomorrow
      if (sessionDate.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise return formatted date
      return `${sessionDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}, ${sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };
    
    return (
        <div className="grid grow grid-rows-[auto_1fr_auto] items-start gap-8 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Quick Start Lesson Card */}
                <Card className="h-full">
                    <CardHeader className="pb-2">
                        <CardTitle>Quick Start a Lesson</CardTitle>
                        <CardDescription>Continue your medical diagnostic training</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            <div className="rounded-md overflow-hidden relative h-40 bg-gray-100">
                                <Image 
                                    src="/images/preview.png" 
                                    alt="Lesson preview" 
                                    width={400} 
                                    height={200}
                                    className="object-cover w-full h-full"
                                    unoptimized
                                    placeholder="blur"
                                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                                    <h3 className="text-white font-medium">Introduction to Diagnostic Reasoning</h3>
                                </div>
                            </div>
                            
                            {/* Hearts display */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                {isPremium ? <Image src="/icons/heart_infinity.svg" alt="Premium" width={24} height={24} /> : <div className="flex gap-1">
                                        {Array.from({ length: stats.maxHearts }).map((_, i) => (
                                            <HeartIcon 
                                                key={i} 
                                                className={`h-5 w-5 ${i < stats.hearts ? 'text-destructive fill-destructive' : 'text-muted-foreground'}`} 
                                            />
                                        ))}
                                    </div>}
                                    <span className="text-sm text-muted-foreground">
                                        {isPremium ? "Unlimited" : `${stats.hearts}/${stats.maxHearts}`}
                                    </span>
                                </div>
                                {countdown && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center">
                                        <span className="mr-1">⏱️</span>
                                        Next in {countdown}
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" disabled={stats.hearts <= 0}>
                            <Link href="/lections">Continue Learning</Link>
                        </Button>
                    </CardFooter>
                </Card>

                {/* Upcoming Sessions Card */}
                <Card className="h-full">
                    <CardHeader className="pb-2">
                        <CardTitle>Upcoming Sessions</CardTitle>
                        <CardDescription>Your scheduled diagnostic training sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4">
                            {loading ? (
                                <div className="flex justify-center items-center h-32">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : error ? (
                                <div className="p-4 text-sm text-red-600 bg-red-50 rounded-md">
                                    {error}
                                </div>
                            ) : sessions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                                    <p>No scheduled sessions yet</p>
                                    <Link href="/schedule" className="text-sm text-blue-600 hover:underline mt-2">
                                        Create your first study session
                                    </Link>
                                </div>
                            ) : (
                                sessions
                                    .filter(s => new Date(s.date) > new Date()) // Only show future sessions
                                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Sort by date ascending
                                    .slice(0, 3) // Only show first 3
                                    .map((session) => (
                                        <div key={session.id} className="flex flex-col gap-1 p-3 rounded-md border">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-medium">{session.title}</h4>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                                    {session.completed ? "Completed" : "Scheduled"}
                                                </span>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{formatSessionDate(session.date)}</div>
                                            <div className="text-sm">Duration: {session.duration}</div>
                                            {session.description && (
                                                <div className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                    {session.description}
                                                </div>
                                            )}
                                        </div>
                                    ))
                            )}
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/schedule">View All Sessions</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            {/* Bottom Section with Additional Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                {/* Progress Statistics Card */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Your Progress</CardTitle>
                        <CardDescription>Overall learning statistics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.loading ? (
                            <div className="flex justify-center items-center h-20">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="flex justify-between mb-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.completedLections}</div>
                                    <div className="text-sm text-muted-foreground">Lessons</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                                    <div className="text-sm text-muted-foreground">Quizzes</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
                                    <div className="text-sm text-muted-foreground">Accuracy</div>
                                </div>
                            </div>
                        )}
                        <Button variant="outline" asChild className="w-full">
                            <Link href="/statistic">View Detailed Stats</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Practice Quiz Card */}
                {/* <Card>
                    <CardHeader className="pb-2">
                        <CardTitle>Quick Quiz</CardTitle>
                        <CardDescription>Test your diagnostic knowledge</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-3">
                            <p className="text-sm">Ready for a challenge? Take a quick quiz to test your knowledge on medical diagnostics.</p>
                            <div className="flex gap-2">
                                <div className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">5 minutes</div>
                                <div className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">10 questions</div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" asChild className="w-full" disabled={stats.hearts <= 0}>
                            <Link href="/lections">Start Quiz</Link>
                        </Button>
                    </CardFooter>
                </Card> */}

                {/* Premium Features Card */}
                <Card className={isPremium ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200"}>
                    <CardHeader className="pb-2">
                        <CardTitle>{isPremium ? "Premium Features" : "Upgrade to Premium"}</CardTitle>
                        <CardDescription>{isPremium ? "Your exclusive benefits" : "Unlock advanced features"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                Advanced case studies
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                Expert feedback sessions
                            </li>
                            <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                    <path d="M20 6L9 17l-5-5"></path>
                                </svg>
                                Unlimited practice quizzes
                            </li>
                            {!isPremium && (
                                <li className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                                        <path d="M20 6L9 17l-5-5"></path>
                                    </svg>
                                    Infinite hearts - never wait
                                </li>
                            )}
                        </ul>
                    </CardContent>
                    <CardFooter>
                        {!isPremium && (
                            <Button variant="default" asChild className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                                <Link href="/upgrade">Upgrade Now</Link>
                            </Button>
                        )}
                        {isPremium && (
                            <div className={satoshi.className + " w-full text-center bg-blue-800/25 px-3 py-1.5 rounded-md text-blue-600 font-medium"}>Premium Member</div>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
