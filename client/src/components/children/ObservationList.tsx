import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Observation } from "@shared/schema";

interface ObservationListProps {
  observations: Observation[];
}

export default function ObservationList({ observations }: ObservationListProps) {
  const sortedObservations = [...observations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedObservations.map((observation) => (
        <Card key={observation.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(observation.date).toLocaleDateString()}
              </CardTitle>
              <Badge>{observation.type}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{observation.content}</p>
            {observation.learningGoals && observation.learningGoals.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Leerdoelen:</h4>
                <div className="flex flex-wrap gap-2">
                  {observation.learningGoals.map((goal, index) => (
                    <Badge key={index} variant="outline">
                      {goal}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {observations.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          Nog geen observaties beschikbaar.
        </div>
      )}
    </div>
  );
}
