"use client";

import Image from "next/image"
import Link from "next/link"
import {  satoshi } from "./fonts"
import { authClient } from "@/lib/auth-client";


export default function Home() {
    const { data: session } = authClient.useSession();

  const isPremium = session?.user && (session.user as any).premium === true;

    return (
        <div className="grid grow grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 font-[family-name:var(--font-geist-sans)] sm:p-20">
            <main className="row-start-2 flex flex-col items-center gap-8 sm:items-start">
               
            </main>
            <footer className="row-start-3 flex flex-wrap items-center justify-center gap-6">
               {isPremium ? <div className={satoshi.className + " bg-blue-800/25 px-3 py-1.5 rounded-md text-blue-600 font-medium"}>Premium Member</div> : <Link href="/upgrade"><div className={ satoshi.className}>Upgrade to Premium</div></Link>}
            </footer>
        </div>
    )
}
