import { NextResponse } from "next/server";
import { getStudySessions } from "@/actions/studySchedule";
import { getSession } from "@/actions/auth";

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    const studySessions = await getStudySessions();
    
    if (studySessions === null) {
      return NextResponse.json(
        { error: "Failed to fetch study sessions" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(studySessions);
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    return NextResponse.json(
      { error: "Failed to fetch study sessions" },
      { status: 500 }
    );
  }
}