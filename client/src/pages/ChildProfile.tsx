import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ObservationForm from "@/components/children/ObservationForm";
import ObservationList from "@/components/children/ObservationList";
import { type Child, type Observation } from "@shared/schema";
import { dutch } from "@/lib/dutch";

export default function ChildProfile() {
  const { id } = useParams();
  const childId = Number(id);

  const { data: child } = useQuery<Child>({ 
    queryKey: [`/api/children/${childId}`] 
  });
  const { data: observations = [] } = useQuery<Observation[]>({ 
    queryKey: [`/api/children/${childId}/observations`] 
  });

  if (!child) {
    return <div className="text-center">{dutch.common.loading}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{child.name}</h1>
          <p className="text-muted-foreground">
            Geboortedatum: {new Date(child.dateOfBirth).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="observations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="observations">Observaties</TabsTrigger>
          <TabsTrigger value="development">Ontwikkeling</TabsTrigger>
        </TabsList>

        <TabsContent value="observations">
          <Card>
            <CardHeader>
              <CardTitle>Nieuwe Observatie</CardTitle>
            </CardHeader>
            <CardContent>
              <ObservationForm childId={childId} />
            </CardContent>
          </Card>

          <div className="mt-8">
            <ObservationList observations={observations} />
          </div>
        </TabsContent>

        <TabsContent value="development">
          <Card>
            <CardHeader>
              <CardTitle>Ontwikkelingsvoortgang</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Hier komt een overzicht van de ontwikkelingsvoortgang.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
