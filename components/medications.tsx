import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const medications = [
  { name: "Aspirin", dosage: "81mg", frequency: "Daily" },
  { name: "Lisinopril", dosage: "10mg", frequency: "Twice daily" },
  { name: "Metformin", dosage: "500mg", frequency: "With meals" },
]

export function Medications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Medications</CardTitle>
        <CardDescription>Based on your health risks</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Medication</TableHead>
              <TableHead>Dosage</TableHead>
              <TableHead>Frequency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medications.map((med) => (
              <TableRow key={med.name}>
                <TableCell>{med.name}</TableCell>
                <TableCell>{med.dosage}</TableCell>
                <TableCell>{med.frequency}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

