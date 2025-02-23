import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function RiskAssessment() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Risk Assessment</CardTitle>
        <CardDescription>Based on your current health metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Cardiovascular Risk</span>
            <span className="text-sm font-medium">15%</span>
          </div>
          <Progress value={15} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Diabetes Risk</span>
            <span className="text-sm font-medium">8%</span>
          </div>
          <Progress value={8} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Respiratory Risk</span>
            <span className="text-sm font-medium">5%</span>
          </div>
          <Progress value={5} className="h-2" />
        </div>
      </CardContent>
    </Card>
  )
}

