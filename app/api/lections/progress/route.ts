import { db } from "@/database/db";
import { userLectionProgress } from "@/database/schema/userLectionProgress";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/actions/auth";

export async function POST(request: NextRequest) {
	try {
		const session = await getSession();

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const body = await request.json();
		const { lectionId, currentHearts, progress, completed } = body;

		// Verify that userId matches session user id
		const userId = session.user.id;

		if (!userId || !lectionId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Find the user progress
		const progressEntry = await db.query.userLectionProgress.findFirst({
			where: (userLectionProgress, { and }) =>
				and(
					eq(userLectionProgress.userId, userId),
					eq(userLectionProgress.lectionId, lectionId)
				),
		});

		if (!progressEntry) {
			return NextResponse.json(
				{ error: "Progress entry not found" },
				{ status: 404 }
			);
		}

		// Update the progress
		await db
			.update(userLectionProgress)
			.set({
				currentHearts,
				progress,
				completed,
				lastInteraction: new Date(),
			})
			.where(
				and(
					eq(userLectionProgress.userId, userId),
					eq(userLectionProgress.lectionId, lectionId)
				)
			);

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("Error updating progress:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
