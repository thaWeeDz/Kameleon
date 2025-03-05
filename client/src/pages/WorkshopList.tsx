import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import WorkshopForm from "@/components/workshops/WorkshopForm";
import { type Workshop } from "@shared/schema";
import { Plus, Search } from "lucide-react";
import { dutch } from "@/lib/dutch";

export default function WorkshopList() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { data: workshops = [], isLoading } = useQuery<Workshop[]>({ 
    queryKey: ["/api/workshops"]
  });

  const filteredWorkshops = workshops.filter((workshop) =>
    workshop.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return <div className="text-center">{dutch.common.loading}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Workshops</h1>
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

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Zoek workshops..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredWorkshops.map((workshop) => (
          <WorkshopCard key={workshop.id} workshop={workshop} />
        ))}
      </div>

      {filteredWorkshops.length === 0 && (
        <div className="text-center text-muted-foreground">
          {dutch.common.noData}
        </div>
      )}
    </div>
  );
}
