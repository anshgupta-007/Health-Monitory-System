import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserHealthDetailsProps {
  userId: string
  currentDoctor: string
  roomNo: string
  prescriptions: string[]
}

export function UserHealthDetails({ userId, currentDoctor, roomNo, prescriptions }: UserHealthDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Health Details</CardTitle>
        <CardDescription>Patient ID: {userId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Current Doctor</h3>
            <p>{currentDoctor}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Room Number</h3>
            <p>{roomNo}</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Prescriptions</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptions.map((prescription, index) => {
                  const [medication, dosage, frequency] = prescription.split(", ")
                  return (
                    <TableRow key={index}>
                      <TableCell>{medication}</TableCell>
                      <TableCell>{dosage}</TableCell>
                      <TableCell>{frequency}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

