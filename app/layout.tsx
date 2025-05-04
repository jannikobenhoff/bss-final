import type { Metadata } from "next"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import type { ReactNode } from "react"
import { Providers } from "./providers"
import {  satoshi } from "./fonts"
import { ThemeProvider} from "next-themes"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
    title: "DiagnoHero",
    description: "Sharpen your medical diagnostic skills with interactive case studies",
    icons: {
        icon: "/images/logo.png",
    },
}

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={ satoshi.variable}>
            <body className="font-satoshi antialiased">
                <ThemeProvider attribute="class" defaultTheme="light">
                    <Providers>
                        <div className="flex min-h-svh flex-col">
                            <Header />
                            {children}
                        </div>
                    </Providers>
                </ThemeProvider>
                <Toaster />
            </body>
        </html>
    )
}
