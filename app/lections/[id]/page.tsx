import { getSession } from "@/actions/auth";
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { redirect, notFound } from "next/navigation";
import { lections, Lection, users } from "@/database/schema";
import { questions, Question } from "@/database/schema";
import { userLectionProgress, UserLectionProgress } from "@/database/schema/userLectionProgress";
import { nanoid } from "nanoid";
import { LectionQuiz } from "@/app/lections/[id]/quiz";

export default async function LectionPage({ params }: { params: { id: string } }) {
    const session = await getSession();

    if (!session) {
        redirect("/auth/sign-in");
    }
    // Get user details
    const user = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
    });

    if (!user) {
        redirect("/auth/sign-in");
    }
    // Fetch the lection
    const lection = await db.query.lections.findFirst({
        where: eq(lections.id, params.id),
    });

    if (!lection) {
        notFound();
    }
    // Fetch all questions for this lection
    const lectionQuestions = await db.query.questions.findMany({
        where: eq(questions.lectionId, lection.id),
    });

    if (lectionQuestions.length === 0) {
        return (
            <main className="py-8 px-4">
                <section className="container mx-auto max-w-4xl">
                    <h1 className="text-2xl font-bold mb-6">{lection.title}</h1>
                    <div className="bg-muted p-8 rounded-lg text-center">
                        <p className="text-lg">No questions available for this lection yet.</p>
                    </div>
                </section>
            </main>
        );
    }

    // Get or create user progress for this lection
    let userProgress = await db.query.userLectionProgress.findFirst({
        where: (userLectionProgress, { and }) => and(
            eq(userLectionProgress.userId, session.user.id),
            eq(userLectionProgress.lectionId, lection.id)
        ),
    });

    if (!userProgress) {
        const progressId = nanoid();
        await db.insert(userLectionProgress).values({
            id: progressId,
            userId: session.user.id,
            lectionId: lection.id,
            completed: false,
        });

        userProgress = await db.query.userLectionProgress.findFirst({
            where: eq(userLectionProgress.id, progressId),
        });
    }

    if (!userProgress) {
        return (
            <main className="py-8 px-4">
                <section className="container mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Error</h1>
                    <p>Could not initialize lection progress.</p>
                </section>
            </main>
        );
    }

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto max-w-4xl">
                <LectionQuiz 
                    lection={lection}
                    questions={lectionQuestions as Question[]}
                    initialProgress={userProgress}
                    user={user}
                    userId={session.user.id}
                />
            </section>
        </main>
    );
}
