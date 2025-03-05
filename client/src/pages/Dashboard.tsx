import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkshopCard from "@/components/workshops/WorkshopCard";
import { type Workshop, type Child } from "@shared/schema";
import { BookOpen, Users, Calendar } from "lucide-react";

export default function Dashboard() {
  const { data: workshops = [] } = useQuery<Workshop[]>({ queryKey: ["/api/workshops"] });
  const { data: children = [] } = useQuery<Child[]>({ queryKey: ["/api/children"] });

  const activeWorkshops = workshops.filter(w => w.status === "active");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actieve Workshops</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkshops.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kinderen</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{children.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Geplande Sessies</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workshops.filter(w => w.status === "active").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workshops" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workshops">Actieve Workshops</TabsTrigger>
          <TabsTrigger value="recent">Recente Activiteiten</TabsTrigger>
        </TabsList>
        <TabsContent value="workshops" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeWorkshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recente Activiteiten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hier komen de meest recente activiteiten te staan.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
