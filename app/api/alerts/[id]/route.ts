// import { NextResponse } from "next/server"
// import type { Alert } from "@/components/ui/alert"

// // In-memory store for alerts (in production, use a database)
// let alerts: Alert[] = []

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const alertId = params.id;
//   const updatedAlert = await request.json();
//   const index = alerts.findIndex(a => a.id === Number(alertId));
//   if (index === -1) {
//     console.log("Out of Index Error");
//     return NextResponse.json(
//       { error: "Alert not found" },
//       { status: 404 }
//     );
//   }

//   alerts[index] = { ...alerts[index], ...updatedAlert };
//   return NextResponse.json(alerts[index]);
// }


import { NextResponse } from "next/server";
import { updateAlert } from "@/lib/alerts";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const alertId = params.id;
  const updatedFields = await request.json();

  const updatedAlert = updateAlert(alertId, updatedFields);
  if (!updatedAlert) {
    return NextResponse.json(
      { error: "Alert not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedAlert);
}