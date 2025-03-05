import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Workshop } from "@shared/schema";
import { Pencil } from "lucide-react";

interface WorkshopCardProps {
  workshop: Workshop;
}

export default function WorkshopCard({ workshop }: WorkshopCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{workshop.title}</CardTitle>
          <Badge variant={workshop.status === "active" ? "default" : "secondary"}>
            {workshop.status === "active" ? "Actief" : "Afgerond"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{workshop.description}</p>
        {workshop.learningGoals && workshop.learningGoals.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Leerdoelen:</h4>
            <div className="flex flex-wrap gap-2">
              {workshop.learningGoals.map((goal, index) => (
                <Badge key={index} variant="outline">
                  {goal}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {workshop.materials && workshop.materials.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Materialen:</h4>
            <div className="flex flex-wrap gap-2">
              {workshop.materials.map((material, index) => (
                <Badge key={index} variant="outline">
                  {material}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          <Pencil className="mr-2 h-4 w-4" />
          Bewerken
        </Button>
      </CardFooter>
    </Card>
  );
}
