import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecordingInterface from "@/components/recording/RecordingInterface";
import { type Session, type Recording } from "@shared/schema";
import { AlertCircle, Mic, Video, Plus, Flag, ArrowLeft } from "lucide-react";

interface Tag {
  id: string;
  timestamp: number;
  created_at: string;
}

export default function SessionView() {
  const { id } = useParams();
  const sessionId = Number(id);
  const [showRecording, setShowRecording] = useState(false);

  const { data: session, isLoading: isSessionLoading, error: sessionError } = useQuery<Session>({ 
    queryKey: [`/api/sessions/${sessionId}`],
    retry: 1
  });

  const { data: recordings = [], isLoading: isRecordingsLoading } = useQuery<Recording[]>({ 
    queryKey: [`/api/sessions/${sessionId}/recordings`],
    enabled: !!session // Only fetch recordings if we have a session
  });

  if (sessionError) {
    return (
      <Card className="mx-auto max-w-2xl mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>Er is een fout opgetreden bij het laden van de sessie.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isSessionLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-pulse text-muted-foreground">Laden...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="mx-auto max-w-2xl mt-8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            <p>Sessie niet gevonden.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (showRecording) {
    return (
      <div className="space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => setShowRecording(false)}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Terug naar opnames
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Nieuwe Opname</CardTitle>
          </CardHeader>
          <CardContent>
            <RecordingInterface 
              sessionId={sessionId} 
              onRecordingComplete={() => setShowRecording(false)} 
            />
          </CardContent>
        </Card>
      </div>
    );
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

      <Button 
        onClick={() => setShowRecording(true)}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Start Nieuwe Opname
      </Button>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Opnames</h2>
        {isRecordingsLoading ? (
          <div className="animate-pulse text-muted-foreground">Opnames laden...</div>
        ) : recordings.length === 0 ? (
          <p className="text-muted-foreground">Nog geen opnames voor deze sessie.</p>
        ) : (
          recordings.map((recording) => (
            <Card key={recording.id}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {recording.mediaType === 'video' ? (
                        <Video className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                      <p className="font-medium">
                        {new Date(recording.startTime).toLocaleTimeString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Status: {recording.status}
                    </p>
                  </div>

                  {recording.tags && Array.isArray(recording.tags) && recording.tags.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {(recording.tags as Tag[]).map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              const videoElement = document.querySelector(`#video-${recording.id}`) as HTMLVideoElement;
                              if (videoElement) {
                                videoElement.currentTime = tag.timestamp;
                                videoElement.play();
                              }
                            }}
                            className="text-sm bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-md transition-colors duration-200 flex items-center gap-2"
                          >
                            <Flag className="h-3 w-3" />
                            {new Date(tag.timestamp * 1000).toISOString().substr(11, 8)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {recording.mediaUrl && (
                    <div className="relative rounded-lg overflow-hidden bg-slate-950">
                      {recording.mediaType === 'video' ? (
                        <video
                          id={`video-${recording.id}`}
                          src={recording.mediaUrl}
                          controls
                          className="w-full aspect-video"
                        />
                      ) : (
                        <audio
                          id={`audio-${recording.id}`}
                          src={recording.mediaUrl}
                          controls
                          className="w-full p-4"
                        />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}