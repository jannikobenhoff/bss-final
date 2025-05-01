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
    // Access premium status with optional chaining
    const isPremium = session?.user && (session.user as any).premium === true;

    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-background/60 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/images/logo.png"
                            alt="DiagnoHero Logo"
                            width={24}
                            height={24}
                            className="object-contain"
                        />
                        <div className="text-2xl font-bold sm:flex hidden">DiagnoHero</div>
                    </Link>
                    <nav className="flex items-center gap-2">
                    <Link href="/lections">
                        <Button variant="ghost" className="sm:flex sm:items-center hidden">
                            <Image
                                src="/icons/trophy.svg"
                                alt="Level Icon"
                                width={18}
                                height={18}
                                className="mr-2 text-primary"
                            />
                            Lections
                        </Button>
                        <Button variant="ghost" className="sm:hidden">
                            <Image
                                src="/icons/trophy.svg"
                                alt="Level Icon"
                                width={18}
                                height={18}
                                className="text-primary"
                            />
                        </Button>
                    </Link>

                    <Link href="/statistic">
                        <Button variant="ghost" className="sm:flex sm:items-center hidden">
                            <Image
                                src="/icons/flame.svg"
                                alt="Statistics Icon"
                                width={18}
                                height={18}
                                className="mr-2 text-primary"
                            />
                            Statistic
                        </Button>
                        <Button variant="ghost" className="sm:hidden">
                            <Image
                                src="/icons/flame.svg"
                                alt="Statistics Icon"
                                width={18}
                                height={18}
                                className="text-primary"
                            />
                        </Button>
                    </Link>
                    </nav>
                </div>
                
                <div className="flex items-center gap-2">
                    {isPremium ? (
                        <div className="flex items-center bg-blue-800/25 px-3 py-1.5 rounded-md text-white font-medium">
                            <Image
                                src="/icons/crown_blue.svg"
                                alt="Premium Icon"
                                width={18}
                                height={18}
                            />
                        </div>
                    ) : (
                        <Link href="/upgrade">
                            <Button variant="default" className="sm:flex sm:items-center hidden bg-blue-800 hover:bg-blue-950">
                                <Image
                                    src="/icons/crown.svg"
                                    alt="Premium Icon"
                                    width={18}
                                    height={18}
                                    className="mr-2 text-primary"
                                />
                                Unlock Premium
                            </Button>
                            <Button variant="ghost" className="sm:hidden">
                                <Image
                                    src="/icons/crown.svg"
                                    alt="Premium Icon"
                                    width={18}
                                    height={18}
                                    className="text-primary"
                                />
                            </Button>
                        </Link>
                    )}
                    <UserButton />
                </div>
            </div>
        </header>
    )
}
