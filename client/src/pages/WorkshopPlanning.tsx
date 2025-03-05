import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import WorkshopForm from "@/components/workshops/WorkshopForm";
import { type Workshop } from "@shared/schema";
import { Plus } from "lucide-react";
import { dutch } from "@/lib/dutch";

export default function WorkshopPlanning() {
  const [open, setOpen] = useState(false);
  const { data: workshops = [], isLoading } = useQuery<Workshop[]>({ 
    queryKey: ["/api/workshops"]
  });

  const weekDays = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag"];

  if (isLoading) {
    return <div className="text-center">{dutch.common.loading}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workshop Planning</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {dutch.workshops.new}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{dutch.workshops.new}</DialogTitle>
            </DialogHeader>
            <WorkshopForm onSuccess={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {weekDays.map((day) => (
          <Card key={day}>
            <CardHeader className="pb-3">
              <CardTitle>{day}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {workshops
                  .filter((w) => w.status === "active")
                  .map((workshop) => (
                    <div
                      key={workshop.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted"
                    >
                      <span className="font-medium">{workshop.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {workshop.learningGoals?.join(", ")}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
