import type { Metadata } from "next"
import "@/styles/globals.css"
import { Header } from "@/components/header"
import type { ReactNode } from "react"
import { Providers } from "./providers"
import { fredoka } from "./fonts"
import { ThemeProvider} from "next-themes"

export const metadata: Metadata = {
    title: "DiagnoHero",
    description: "Sharpen your medical diagnostic skills with interactive case studies",
}

export default function RootLayout({
    children
}: Readonly<{
    children: ReactNode
}>) {
    return (
        <html lang="en" suppressHydrationWarning className={fredoka.variable}>
            <body className="font-fredoka antialiased">
                <ThemeProvider attribute="class" defaultTheme="light">
                    <Providers>
                        <div className="flex min-h-svh flex-col">
                            <Header />
                            {children}
                        </div>
                    </Providers>
                </ThemeProvider>
            </body>
        </html>
    )
}
