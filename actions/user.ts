"use server";

import { getSession } from "@/actions/auth";
import { db } from "@/database/db";
import { users } from "@/database/schema/auth";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { Constants } from "@/lib/constants";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getCurrentUser() {
	function applyHeartRegeneration(
		currentHearts: number,
		lastHeartRefill: Date
	): {
		hearts: number;
		lastHeartRefill: Date;
	} {
		if (currentHearts >= Constants.maxHearts) {
			return { hearts: currentHearts, lastHeartRefill };
		}

		const now = new Date();
		const elapsed = Math.floor(
			(now.getTime() - lastHeartRefill.getTime()) / 1000
		);
		const heartsGained = Math.floor(elapsed / Constants.secondsPerHeart);

		if (heartsGained === 0) {
			return { hearts: currentHearts, lastHeartRefill };
		}

		const newHearts = Math.min(
			currentHearts + heartsGained,
			Constants.maxHearts
		);
		const secondsUsed = heartsGained * Constants.secondsPerHeart;
		const newLastRefill = new Date(
			lastHeartRefill.getTime() + secondsUsed * 1000
		);

		return {
			hearts: newHearts,
			lastHeartRefill: newLastRefill,
		};
	}

	const session = await getSession();
	if (!session) {
		return null;
	}

	const user = await db.query.users.findFirst({
		where: eq(users.id, session.user.id),
	});

	if (!user) {
		return null;
	}

	const { hearts: updatedHearts, lastHeartRefill: updatedLastRefill } =
		applyHeartRegeneration(user.lives, user.livesUpdatedAt);

	if (updatedHearts > user.lives) {
		await db
			.update(users)
			.set({
				lives: updatedHearts,
				livesUpdatedAt: updatedLastRefill,
			})
			.where(eq(users.id, user.id));

		return {
			...user,
			lives: updatedHearts,
			livesUpdatedAt: updatedLastRefill,
		};
	}

	return user;
}

export async function removeLife(): Promise<{
	success: boolean;
	error: string | null;
}> {
	const session = await getSession();
	if (!session) {
		return { success: false, error: "Unauthorized" };
	}

	const isPremium = session?.user && (session.user as any).premium === true;

	if (isPremium) {
		return { success: false, error: "Premium users cannot remove lives" };
	}

	const user = await getCurrentUser();

	if (!user) {
		return { success: false, error: "User not found" };
	}

	if (user.lives <= 0) {
		return { success: false, error: "No lives remaining" };
	}

	const result = await db
		.update(users)
		.set({
			lives: user.lives - 1,
		})
		.where(eq(users.id, session.user.id))
		.returning();

	if (result.length === 0) {
		return {
			success: false,
			error: "Failed to update user lives",
		};
	}

	revalidatePath("/lections/[id]");
	revalidatePath("/statistic");

	return { success: true, error: null };
}

export async function upgradeToPremium(userId: string): Promise<boolean> {
	try {
		await db.update(users).set({ premium: true }).where(eq(users.id, userId));

		return true;
	} catch (error) {
		console.error("Error upgrading to premium:", error);
		return false;
	}
}

export async function cancelPremium(userId: string): Promise<boolean> {
	try {
		await db.update(users).set({ premium: false }).where(eq(users.id, userId));
		return true;
	} catch (error) {
		console.error("Error canceling premium subscription:", error);
		return false;
	}
}

export async function refreshUserSession(): Promise<boolean> {
	try {
		const session = await getSession();
		if (!session) {
			return false;
		}

		// Get the current session token
		const sessionToken = session.session.id;

		// Revoke only the current session to force it to be refreshed
		// This tells the server to invalidate this session
		await auth.api.revokeSession({
			body: { token: sessionToken },
			headers: await headers(),
		});

		// This ensures any session cookies are properly cleared server-side
		revalidatePath("/", "layout");

		return true;
	} catch (error) {
		console.error("Error refreshing user session:", error);
		return false;
	}
}

// export function getTimeUntilNextHeart(
// 	currentHearts: number,
// 	lastHeartRefill: Date
// ): Promise<number | null> {
// 	// If hearts are at max, return null (no regeneration needed)
// 	if (currentHearts >= Constants.maxHearts) {
// 		return null;
// 	}

// 	const now = new Date();
// 	const elapsedSeconds = Math.floor(
// 		(now.getTime() - lastHeartRefill.getTime()) / 1000
// 	);
// 	const secondsPerHeart = Constants.secondsPerHeart;

// 	// Calculate remaining seconds until next heart
// 	const remainingSeconds = secondsPerHeart - (elapsedSeconds % secondsPerHeart);

// 	return remainingSeconds;
// }
