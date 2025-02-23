// lib/alerts.ts
import type { Alert } from "@/components/ui/alert";
import mailSender from "@/utils/mailsender"
let alerts: Alert[] = [];
// import { parsePatientEmails } from "@/components/parseCsv";

// const loadPatientEmails = async () => {
//   try {
//     const patientEmails = await parsePatientEmails();
//     console.log('Loaded patient emails:', patientEmails);
//     return patientEmails;
//   } catch (error) {
//     console.error('Failed to load patient emails:', error);
//     return [];
//   }
// };

export const getAlerts = (patientId?: string) => {
  if (patientId) {
    return alerts.filter(alert => alert.patientId === patientId);
  }
  return alerts;
};

export const addAlert = (alert: Omit<Alert, "id" | "status">) => {
  const newAlert: Alert = {
    ...alert,
    id: crypto.randomUUID(),
    status: "pending"
  };
  alerts.push(newAlert);
  

  console.log("alert size", alerts.length);
  
  return newAlert;
};

// const fetchEmail = async () => {
//   const patientEmails = await loadPatientEmails();
//   const patientEmailMap = new Map(patientEmails.map((p) => [p.patientId, p.email]));
//   return patientEmailMap;
// }



export const updateAlert = (id: string, updatedFields: Partial<Alert>) => {
  //console.log("Alert Size", alerts.length);
  const index = alerts.findIndex(a => a.id === id);
  console.log("index", index);
  if (index === -1) return null;
  
  alerts[index] = { ...alerts[index], ...updatedFields };
  return alerts[index];
};