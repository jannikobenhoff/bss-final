"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSession } from "@/actions/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { upgradeToPremium } from "@/actions/user";
import { authClient } from "@/lib/auth-client";
import { refreshUserSession } from "@/actions/user";


export default function UpgradePage() {

   
    
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { data: session, refetch } = authClient.useSession();

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const session = await getSession();
      if (!session) {
        router.push("/auth/sign-in");
        return;
      }
      
      const success = await upgradeToPremium(session.user.id);
      if (success) {
        setIsSuccess(true);
        
        // Force refresh the session
        await refreshUserSession();
        
        // Show success message briefly
        setTimeout(() => {
          // Explicitly sign out the user and redirect to login
          authClient.signOut().then(() => {
            router.push("/auth/sign-in?callbackUrl=/");
          });
        }, 1500);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    redirect("/auth/sign-in");
  }

  const isPremium = session?.user && (session.user as any).premium === true;

  if (isPremium) {
    redirect("/");
  }

  return (
    <main className="py-12 px-4">
      <section className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-4">Upgrade to Premium</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlock all features and take your medical diagnostic skills to the next level
          </p>
        </div>

        <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Premium Benefits</h2>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="text-primary">✓</div>
                  <span>Unlimited access to all case studies</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="text-primary">✓</div>
                  <span>Advanced statistics and performance tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="text-primary">✓</div>
                  <span>Exclusive educational content</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="text-primary">✓</div>
                  <span>Priority support</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex flex-col items-center text-center">
              <div className="text-4xl font-bold mb-2">$9.99<span className="text-lg font-normal">/month</span></div>
              <p className="text-muted-foreground mb-6">Cancel anytime</p>
              <Button 
                onClick={handleUpgrade} 
                disabled={isLoading || isSuccess}
                className="w-full max-w-xs"
                size="lg"
              >
                {isLoading ? "Processing..." : isSuccess ? "Upgraded!" : "Upgrade Now"}
              </Button>
              {isSuccess && (
                <p className="text-green-600 dark:text-green-400 mt-4">
                  Successfully upgraded! Redirecting...
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>This is a demo application. No actual payment is processed.</p>
        </div>
      </section>
    </main>
  );
}