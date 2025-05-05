import { getSession } from "@/actions/auth"
import { db } from "@/database/db";
import { eq, and, gte, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { userActivity } from "@/database/schema/userActivity";
import { users } from "@/database/schema/auth";
import { userLectionProgress } from "@/database/schema/userLectionProgress";
import { HeartIcon, BookOpenIcon, FlameIcon, TrophyIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ActivityGrid from "@/components/ActivityGrid";
import { getCurrentUser } from "@/actions/user";
import { Constants } from "@/lib/constants";
import Image from "next/image";

export default async function StatisticsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    // Get user details
    const user = await getCurrentUser();
    
    if (!user) {
        redirect("/auth/sign-in");
    }

    const isPremium = session.user.premium || false;

    // Get user activity for last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const activities = await db.query.userActivity.findMany({
        where: and(
            eq(userActivity.userId, session.user.id),
            gte(userActivity.createdAt, threeMonthsAgo)
        ),
        orderBy: [desc(userActivity.createdAt)]
    });

    // Get completed lections count
    const completedLections = await db.query.userLectionProgress.findMany({
        where: and(
            eq(userLectionProgress.userId, session.user.id),
            eq(userLectionProgress.completed, true)
        )
    });

    // Calculate next life regeneration time
    const now = new Date();
    let nextLifeRegenerationTime = null;
    let formattedNextLifeTime = "";
    
    if (user.lives < 5) {
        // Life regenerates every hour, calculate time until next regeneration
        const timeInSecondsLastRefill = user.livesUpdatedAt.getTime() + (Constants.secondsPerHeart * 1000)
        const minutesUntilNextLife = ((timeInSecondsLastRefill - now.getTime()) / 60000).toFixed(0);

        nextLifeRegenerationTime = new Date();//minutesUntilNextLife * 60 * 1000);
        console.log(minutesUntilNextLife)
        console.log(new Date(timeInSecondsLastRefill))
        formattedNextLifeTime = `${minutesUntilNextLife} min`;//`${nextLifeRegenerationTime.getHours().toString().padStart(2, '0')}:${nextLifeRegenerationTime.getMinutes().toString().padStart(2, '0')}`;
    }

    // Group activities by day for the activity grid
    const activityByDay = new Map();
    
    activities.forEach(activity => {
        const day = activity.createdAt.toISOString().split('T')[0]; // format as YYYY-MM-DD
        if (!activityByDay.has(day)) {
            activityByDay.set(day, 0);
        }
        activityByDay.set(day, activityByDay.get(day) + 1);
    });

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Statistics</h1>
                <p className="text-muted-foreground mb-4">
                    Here you can find an overview of your progress, your current streak, and your highest streak, completed lections and lives.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                            <FlameIcon className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{user.currentStreak} days</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Highest Streak</CardTitle>
                            <TrophyIcon className="h-5 w-5 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{user.highestStreak} days</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Completed Lections</CardTitle>
                            <BookOpenIcon className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{completedLections.length}</div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">{isPremium ? "Unlimited Lives" : "Lives"}</CardTitle>
                            {isPremium ? <Image src="/icons/heart_infinity.svg" alt="Premium" width={24} height={24} /> : <HeartIcon className="h-5 w-5 text-destructive" />}
                        </CardHeader>
                        {isPremium ? <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                Unlimited
                            </div>
                        </CardContent> : <CardContent>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                {user.lives}/5
                                {nextLifeRegenerationTime && (
                                    <span className="text-xs text-muted-foreground ml-2 flex items-center">
                                        <span className="mr-1">⏱️</span>
                                        Next in {formattedNextLifeTime}
                                    </span>
                                )}
                            </div>
                        </CardContent>}
                    </Card>
                </div>
                
                <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Activity</h2>
                    <Card className="p-6">
                        <div className="w-full overflow-x-auto">
                            <ActivityGrid activityData={activityByDay} />
                        </div>
                    </Card>
                </div>
            </section>
        </main>
    )
} 