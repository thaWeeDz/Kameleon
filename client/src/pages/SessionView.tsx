import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RecordingInterface from "@/components/recording/RecordingInterface";
import { type Session, type Recording } from "@shared/schema";
// Define an extended type for Recording with tags as any type to work with JSON data
type RecordingWithTags = Recording & { tags?: any[] };
import { AlertCircle, Mic, Video, Plus, Flag, ArrowLeft } from "lucide-react";

// Helper function to format timestamp for display
const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface Tag {
  id: string;
  timestamp: number;
  created_at: string;
  screenshot?: string; // Base64 encoded image
}

export default function SessionView() {
  const { id } = useParams();
  const sessionId = Number(id);
  const [showRecording, setShowRecording] = useState(false);

  const { data: session, isLoading: isSessionLoading, error: sessionError } = useQuery<Session>({ 
    queryKey: [`/api/sessions/${sessionId}`],
    retry: 1
  });

  const { data: recordingsRaw = [], isLoading: isRecordingsLoading } = useQuery<RecordingWithTags[]>({ 
    queryKey: [`/api/sessions/${sessionId}/recordings`],
    enabled: !!session // Only fetch recordings if we have a session
  });
  
  // Sort recordings in descending order (newest first)
  const recordings = [...recordingsRaw].sort((a, b) => {
    return new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
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
              onRecordingComplete={() => {
                // This will be called when the user clicks "Terug naar overzicht"
                setShowRecording(false);
              }} 
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

                  {/* Display tags if available */}
                  {recording.tags && Array.isArray(recording.tags) && recording.tags.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags:</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {recording.tags.map((tag: Tag) => (
                          <div key={tag.id} className="flex flex-col gap-1 items-center">
                            {/* Display screenshot thumbnail if available */}
                            {tag.screenshot && recording.mediaType === 'video' ? (
                              <div 
                                className="w-full aspect-video rounded overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors" 
                                onClick={() => {
                                  const videoElement = document.querySelector(`#video-${recording.id}`) as HTMLVideoElement;
                                  if (videoElement) {
                                    videoElement.currentTime = tag.timestamp;
                                    videoElement.play();
                                  }
                                }}
                              >
                                <img 
                                  src={tag.screenshot} 
                                  alt={`Screenshot at ${formatTimestamp(tag.timestamp)}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div 
                                className="w-full aspect-video bg-slate-100 flex items-center justify-center rounded border border-border cursor-pointer hover:border-primary transition-colors"
                                onClick={() => {
                                  const mediaElement = document.querySelector(`#${recording.mediaType}-${recording.id}`) as HTMLMediaElement;
                                  if (mediaElement) {
                                    mediaElement.currentTime = tag.timestamp;
                                    mediaElement.play();
                                  }
                                }}
                              >
                                {recording.mediaType === 'video' ? (
                                  <Video className="h-8 w-8 text-slate-400" />
                                ) : (
                                  <Mic className="h-8 w-8 text-slate-400" />
                                )}
                              </div>
                            )}
                            
                            {/* Tag timestamp button */}
                            <button
                              onClick={() => {
                                const mediaElement = document.querySelector(`#${recording.mediaType}-${recording.id}`) as HTMLMediaElement;
                                if (mediaElement) {
                                  mediaElement.currentTime = tag.timestamp;
                                  mediaElement.play();
                                }
                              }}
                              className="text-xs bg-secondary hover:bg-secondary/80 px-2 py-1 rounded-md transition-colors duration-200 flex items-center gap-1"
                            >
                              <Flag className="h-3 w-3" />
                              {formatTimestamp(tag.timestamp)}
                            </button>
                          </div>
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