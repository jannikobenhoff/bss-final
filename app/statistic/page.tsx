import { getSession } from "@/actions/auth"
import { db } from "@/database/db";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function TodosPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/sign-in");
    }

  

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Statistic</h1>
            </section>
        </main>
    )
} 