import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RecordingInterface from "@/components/recording/RecordingInterface";
import { type Session, type Recording } from "@shared/schema";

export default function SessionView() {
  const { id } = useParams();
  const sessionId = Number(id);

  const { data: session } = useQuery<Session>({ 
    queryKey: [`/api/sessions/${sessionId}`] 
  });
  const { data: recordings = [] } = useQuery<Recording[]>({ 
    queryKey: [`/api/sessions/${sessionId}/recordings`] 
  });

  if (!session) {
    return <div className="text-center">Laden...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sessie Opname</h1>
          <p className="text-muted-foreground">
            {new Date(session.date).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nieuwe Opname</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordingInterface sessionId={sessionId} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Eerdere Opnames</h2>
        {recordings.map((recording) => (
          <Card key={recording.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {new Date(recording.startTime).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {recording.mediaType === 'video' ? 'Video' : 'Audio'} opname
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Status: {recording.status}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
