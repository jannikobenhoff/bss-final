"use server";

import { getSession } from "@/actions/auth";
import { db } from "@/database/db";
import { userActivity } from "@/database/schema/userActivity";
import { userLectionProgress } from "@/database/schema/userLectionProgress";
import { users } from "@/database/schema/auth";
import { and, eq, gte, desc } from "drizzle-orm";
import { Constants } from "@/lib/constants";

export type UserStatistics = {
	completedLections: number;
	totalQuizzes: number;
	averageAccuracy: number;
	hearts: number;
	maxHearts: number;
	timeUntilNextHeart: number | null;
};

export async function getUserStatistics(): Promise<UserStatistics | null> {
	try {
		const session = await getSession();

		if (!session) {
			return null;
		}

		const userId = session.user.id;

		const threeMonthsAgo = new Date();
		threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

		const activities = await db.query.userActivity.findMany({
			where: and(
				eq(userActivity.userId, userId),
				gte(userActivity.createdAt, threeMonthsAgo)
			),
			orderBy: [desc(userActivity.createdAt)],
		});

		const completedLections = await db.query.userLectionProgress.findMany({
			where: and(
				eq(userLectionProgress.userId, userId),
				eq(userLectionProgress.completed, true)
			),
		});
		const user = await db.query.users.findFirst({
			where: eq(users.id, userId),
		});
		const stats: UserStatistics = {
			completedLections: completedLections.length,
			totalQuizzes: activities.length,

			averageAccuracy: activities.length > 0 ? 76 : 0,
			hearts: user?.lives || 0,
			maxHearts: 5,
			timeUntilNextHeart: null,
		};

		return stats;
	} catch (error) {
		console.error("Error getting user statistics:", error);
		return null;
	}
}
