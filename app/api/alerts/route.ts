// import { NextResponse } from "next/server";
// import type { Alert } from "@/components/ui/alert";

// let alerts: Alert[] = [];

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const patientId = searchParams.get("patientId");

//   if (patientId) {
//     return NextResponse.json(alerts.filter(alert => alert.patientId === patientId));
//   }

//   return NextResponse.json(alerts);
// }

// export async function POST(request: Request) {
//   const alert = await request.json();
//   alert.id = crypto.randomUUID();
//   alert.status = "pending";
//   alerts.push(alert);
//   return NextResponse.json(alert);
// }




import { NextResponse } from "next/server";
import { getAlerts, addAlert } from "@/lib/alerts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  return NextResponse.json(getAlerts(patientId || undefined));
}

export async function POST(request: Request) {
  const alertData = await request.json();
  const newAlert = addAlert(alertData);
  return NextResponse.json(newAlert);
}