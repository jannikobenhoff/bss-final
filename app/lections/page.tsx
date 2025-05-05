import { getSession } from "@/actions/auth"
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { lections as lectionsTable, Lection } from "@/database/schema";
import { userLectionProgress } from "@/database/schema/userLectionProgress";
import { asc } from "drizzle-orm";
import type { UserLectionProgress } from "@/database/schema/userLectionProgress";

export default async function LectionsPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

    // Fetch all lections
    const allLections = await db.query.lections.findMany({
        orderBy: [asc(lectionsTable.levelRequired)]
    });

    // Fetch user progress for all lections
    const userProgress = await db.query.userLectionProgress.findMany({
        where: eq(userLectionProgress.userId, session.user.id)
    });

    // Create a map of lection progress by lectionId for easier lookup
    const progressByLectionId = new Map<string, UserLectionProgress>(
        userProgress.map(progress => [progress.lectionId, progress])
    );

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Lections</h1>
                <p className="text-muted-foreground mb-4">
                    Here you can find all the lections that you can complete. If you run out of hearts, you can upgrade to premium to get more hearts or wait for them to regenerate.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allLections.map((lection: Lection) => {
                        const progress = progressByLectionId.get(lection.id) || null;
                        const isCompleted = progress?.completed || false;
                        
                        return (
                            <div 
                                key={lection.id} 
                                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-card text-card-foreground"
                            >
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-xl font-bold">{lection.title}</h3>
                                        {isCompleted && (
                                            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                                                Completed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-muted-foreground mb-4">{lection.description}</p>
                                    <div className="flex items-center justify-end">
                                        {/* <span className="text-sm text-muted-foreground">
                                            Level Required: {lection.levelRequired}
                                        </span> */}
                                        <Link href={`/lections/${lection.id}`}>
                                            <Button variant="default" size="sm" className={`${isCompleted ? "bg-green-800 hover:bg-green-950" : "bg-blue-800 hover:bg-blue-950"}`}>
                                                {isCompleted ? "Review" : "Start"}
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                
                {allLections.length === 0 && (
                    <div className="text-center p-12 border rounded-lg">
                        <p className="text-muted-foreground">No lections available yet.</p>
                    </div>
                )}
            </section>
        </main>
    )
} 