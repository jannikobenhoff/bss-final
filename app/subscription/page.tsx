"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { redirect } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getSession } from "@/actions/auth";
import { cancelPremium, refreshUserSession } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function SubscriptionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { data: session, refetch } = authClient.useSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const isPremium = session?.user && (session.user as any).premium === true;

  if (!isPremium) {
    redirect("/upgrade");
  }

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const userSession = await getSession();
      if (!userSession) {
        router.push("/auth/sign-in");
        return;
      }
      
      const success = await cancelPremium(userSession.user.id);
      if (success) {
        setIsSuccess(true);
        setOpenDialog(false);
        
        // Force refresh the session by revoking it
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

  return (
    <main className="py-12 px-4">
      <section className="container mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Manage Your Subscription</h1>
        <p className="text-muted-foreground mb-4">
        View and manage your premium subscription details.
        </p>

        <div className="bg-card rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Subscription Details</h2>
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md bg-muted/40">
                  <div>
                    <p className="font-medium">Premium Plan</p>
                    <p className="text-sm text-muted-foreground">Active subscription</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="font-bold">$9.99/month</p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-md bg-muted/40">
                  <div>
                    <p className="font-medium">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground">Your card will be charged on this date</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <p className="font-bold">{new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Premium Benefits</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-md bg-muted/40">
                  <div className="text-primary mb-2">✓</div>
                  <h3 className="font-medium mb-1">Unlimited Access</h3>
                  <p className="text-sm text-muted-foreground">Access all case studies without limitations</p>
                </div>
                <div className="p-4 border rounded-md bg-muted/40">
                  <div className="text-primary mb-2">✓</div>
                  <h3 className="font-medium mb-1">Advanced Statistics</h3>
                  <p className="text-sm text-muted-foreground">Detailed performance tracking and insights</p>
                </div>
                <div className="p-4 border rounded-md bg-muted/40">
                  <div className="text-primary mb-2">✓</div>
                  <h3 className="font-medium mb-1">Exclusive Content</h3>
                  <p className="text-sm text-muted-foreground">Access to premium educational materials</p>
                </div>
                <div className="p-4 border rounded-md bg-muted/40">
                  <div className="text-primary mb-2">✓</div>
                  <h3 className="font-medium mb-1">Priority Support</h3>
                  <p className="text-sm text-muted-foreground">Get help faster when you need assistance</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 mt-4">
              <h2 className="text-xl font-bold mb-4">Manage Subscription</h2>
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive">Cancel Subscription</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cancel Premium Subscription</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to cancel your premium subscription? You will lose access to all premium features at the end of your current billing period.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setOpenDialog(false)}
                      disabled={isLoading}
                    >
                      Keep Subscription
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleCancelSubscription}
                      disabled={isLoading || isSuccess}
                    >
                      {isLoading ? "Processing..." : "Cancel Subscription"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              {isSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                  Your subscription has been canceled successfully. You will be redirected shortly.
                </div>
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
