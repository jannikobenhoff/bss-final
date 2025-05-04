"use server";

import { getSession } from "@/actions/auth";
import { db } from "@/database/db";
import { studySessions } from "@/database/schema/studySchedule";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define a Zod schema for validation
const StudySessionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date(),
  duration: z.string(),
});

export type StudySessionType = typeof studySessions.$inferSelect;

/**
 * Gets all study sessions for the current user
 * @returns Array of study sessions or null if error
 */
export async function getStudySessions(): Promise<StudySessionType[] | null> {
  try {
    const session = await getSession();
    
    if (!session) {
      return null;
    }

    const userId = session.user.id;
    
    const sessions = await db.query.studySessions.findMany({
      where: eq(studySessions.userId, userId),
      orderBy: [desc(studySessions.date)],
    });
    
    return sessions;
  } catch (error) {
    console.error("Error getting study sessions:", error);
    return null;
  }
}

type AddStudySessionInput = {
  title: string;
  description?: string;
  date: Date;
  duration: string;
};

/**
 * Adds a new study session
 * @param input Study session data
 * @returns Object with success status, session data, and error message if applicable
 */
export async function addStudySession(input: AddStudySessionInput): Promise<{
  success: boolean;
  data: StudySessionType | null;
  error: string | null;
}> {
  try {
    const session = await getSession();
    
    if (!session) {
      return { 
        success: false, 
        data: null, 
        error: "Unauthorized" 
      };
    }

    const userId = session.user.id;
    
    // Validate input
    const validatedData = StudySessionSchema.parse(input);
    
    // Insert into database
    const [newSession] = await db.insert(studySessions).values({
      userId,
      title: validatedData.title,
      description: validatedData.description || null,
      date: validatedData.date,
      duration: validatedData.duration,
      completed: false,
    }).returning();
    
    revalidatePath("/schedule");
    
    return { 
      success: true, 
      data: newSession, 
      error: null 
    };
  } catch (error) {
    console.error("Error adding study session:", error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        data: null, 
        error: `Validation error: ${error.errors.map(e => e.message).join(", ")}` 
      };
    }
    
    return { 
      success: false, 
      data: null, 
      error: "Failed to add study session" 
    };
  }
}

/**
 * Deletes a study session
 * @param id ID of the study session to delete
 * @returns Object with success status and error message if applicable
 */
export async function deleteStudySession(id: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const session = await getSession();
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    
    const result = await db.delete(studySessions)
      .where(
        and(
          eq(studySessions.id, id),
          eq(studySessions.userId, userId)
        )
      )
      .returning();
    
    if (result.length === 0) {
      return {
        success: false,
        error: "Study session not found or not authorized to delete",
      };
    }
    
    revalidatePath("/schedule");
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting study session:", error);
    return { success: false, error: "Failed to delete study session" };
  }
}

/**
 * Toggles the completion status of a study session
 * @param id ID of the study session to update
 * @param completed New completion status
 * @returns Object with success status and error message if applicable
 */
export async function toggleSessionComplete(id: string, completed: boolean): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    const session = await getSession();
    
    if (!session) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;
    
    const result = await db.update(studySessions)
      .set({ 
        completed,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(studySessions.id, id),
          eq(studySessions.userId, userId)
        )
      )
      .returning();
    
    if (result.length === 0) {
      return {
        success: false,
        error: "Study session not found or not authorized to update",
      };
    }
    
    revalidatePath("/schedule");
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error toggling study session completion:", error);
    return { success: false, error: "Failed to update study session" };
  }
}