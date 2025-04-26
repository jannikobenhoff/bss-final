"use client";

import Link from "next/link"
import { UserButton } from "@daveyplate/better-auth-ui"
import { Button } from "./ui/button"
import { AdminNavEntry } from "./AdminNavEntry"
import { authClient } from "@/lib/auth-client" // import the auth client
import Image from "next/image"
export function Header() {
    const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession();

    const isAdmin = session?.user?.role === "admin";

    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-background/60 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2" style={{ fontFamily: "'Fredoka', sans-serif", fontSize: "1.3rem", fontWeight: "600", color: "blue"}}>
                    DIAGNOHERO
                    </Link>
                    <nav className="flex items-center gap-2">
                    <Link href="/lections">
                            <Button variant="ghost">
                                <Image
                                    src="/icons/trophy.svg"
                                    alt="Level Icon"
                                    width={20}
                                    height={20}
                                    className="mr-2 text-primary"
                                />
                                LECTIONS
                            </Button>
                        </Link>

                        <Link href="/statistic">
                            <Button variant="ghost">
                                <Image
                                    src="/icons/flame.svg"
                                    alt="Statistics Icon"
                                    width={20}
                                    height={20}
                                    className="mr-2 text-primary"
                                />
                                STATISTIC
                            </Button>
                        </Link>
                        
                    </nav>
                </div>

                <UserButton />
            </div>
        </header>
    )
}
