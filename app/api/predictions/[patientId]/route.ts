// app/api/predictions/[patientId]/route.ts
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  try {
    const { patientId } = params;

    const apiUrl = `http://0.0.0.0:8000/predictions/${patientId}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.detail || "Failed to fetch prediction" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}