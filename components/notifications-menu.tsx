"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";
//zimport mailSender from "@/utils/mailsender";



// Updated type definitions
interface AlertAnomaly {
  parameter: string;
  value: number;
  normalRange: {
    min: number;
    max: number;
  };
  timestamp: string;
}

interface Alert {
  id: string;
  patientId: string;
  status: "pending" | "addressed";
  timestamp: string;
  anomalies: AlertAnomaly[];
  prescription?: string;
}

const alertStyles = {
  base: "w-full p-4 rounded-lg border flex flex-col gap-2",
  variant: {
    default: "bg-background text-foreground",
    destructive: "bg-destructive/10 border-destructive/50 text-destructive",
    success: "bg-success/10 border-success/50 text-success",
  },
  title: "text-sm font-medium",
  description: "text-sm text-muted-foreground",
  time: "text-xs text-muted-foreground mt-1",
  badge: "text-xs font-medium px-2 py-1 rounded-full",
};



export function NotificationsMenu() {
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);
  const [prescription, setPrescription] = React.useState("");
  const { user } = useAuth();

  const fetchAlerts = React.useCallback(async () => {
    try {
      const response = await fetch(
        `/api/alerts${user?.role === "patient" ? `?patientId=${user.username}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch alerts");
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  }, [user]);

  React.useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const handleAddressPrescription = async () => {
    if (!selectedAlert) return;

    try {
      const response = await fetch(`/api/alerts/${selectedAlert.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "addressed",
          id: selectedAlert.id,
          prescription,
        }),
      });
      console.log(response);
      if (!response.ok) throw new Error("Failed to address alert");

      setSelectedAlert(null);
      setPrescription("");
      await fetchAlerts();
    } catch (error) {
      console.error("Error addressing alert:", error);
    }
  };

  // Filter pending alerts
  const pendingAlerts = alerts.filter(alert => alert.status === "pending");

  // Flatten anomalies from pending alerts into a notifications array.
  const flattenedNotifications = pendingAlerts.flatMap(alert =>
    alert.anomalies.map((anomaly, index) => ({
      alert,
      anomaly,
      key: `${alert.id}-${index}`,
    }))
  );
  
  // Keep only unique patientId-parameter pairs (up to 6)
  const seenKeys = new Set();
  const uniqueNotifications = [];
  for (const notification of flattenedNotifications) {
    const { patientId, parameter } = notification.anomaly;
    const key = `${patientId}-${parameter}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueNotifications.push(notification);
      //if (uniqueNotifications.length >= 6) break; // Stop when we reach 6
    }
  }
  
  const limitedNotifications = uniqueNotifications;
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="relative">
            <Bell className="h-[1.2rem] w-[1.2rem] text-black" />
            {pendingAlerts.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                {pendingAlerts.length > 6 ? 6 : pendingAlerts.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[400px] max-h-[500px] overflow-y-auto">
          {limitedNotifications.length === 0 ? (
            <DropdownMenuItem className="text-muted-foreground">
              No new notifications
            </DropdownMenuItem>
          ) : (
            limitedNotifications.map(({ alert, anomaly, key }) => (
              <DropdownMenuItem
                key={key}
                className={cn(
                  alertStyles.base,
                  alert.status === "pending"
                    ? alertStyles.variant.destructive
                    : alertStyles.variant.success
                )}
                onSelect={(e) => {
                  e.preventDefault();
                  if (user?.role === "doctor" && alert.status === "pending") {
                    setSelectedAlert(alert);
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={alertStyles.title}>
                    Patient {alert.patientId}: {anomaly.parameter}
                  </span>
                  <Badge
                    variant={alert.status === "pending" ? "destructive" : "success"}
                    className={alertStyles.badge}
                  >
                    {alert.status}
                  </Badge>
                </div>
                <span className={alertStyles.description}>
                  Value: {anomaly.value} (Normal range: {anomaly.normalRange.min}-{anomaly.normalRange.max})
                </span>
                {alert.prescription && (
                  <div className="mt-2 p-2 bg-accent rounded-md">
                    <span className="text-xs font-medium text-primary">Prescription:</span>
                    <p className="text-xs text-muted-foreground">{alert.prescription}</p>
                  </div>
                )}
                <span className={alertStyles.time}>
                  {new Date(anomaly.timestamp).toLocaleString()}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Address Alert</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Patient Details</h4>
              {selectedAlert?.anomalies.map((anomaly, index) => (
                <div key={index} className="mb-4">
                  <p className="text-sm text-muted-foreground">
                    Parameter: {anomaly.parameter}
                    <br />
                    Value: {anomaly.value} (Normal range: {anomaly.normalRange.min}-{anomaly.normalRange.max})
                    <br />
                    Detected: {new Date(anomaly.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Patient ID: {selectedAlert?.patientId}
                <br />
                Alert Created:{" "}
                {selectedAlert?.timestamp && new Date(selectedAlert.timestamp).toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="prescription" className="text-sm font-medium">
                Prescription
              </label>
              <Textarea
                id="prescription"
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Enter your prescription..."
                className="min-h-[100px]"
              />
            </div>
            <Button onClick={handleAddressPrescription} className="w-full">
              Send Prescription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
