import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Session, type Recording, insertSessionSchema } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Mic, Video, Flag } from "lucide-react";
import { dutch } from "@/lib/dutch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Helper function to format timestamp for display
const formatTimestamp = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Define a type for tags
interface Tag {
  id: string;
  timestamp: number;
  created_at: string;
}

// Define an extended type for Recording with tags
type RecordingWithTags = Recording & { tags?: Tag[] };

// Component to show recordings and their tags for each session
interface SessionRecordingsProps {
  sessionId: number;
}

function SessionRecordings({ sessionId }: SessionRecordingsProps) {
  const { data: recordings = [], isLoading } = useQuery<RecordingWithTags[]>({
    queryKey: [`/api/sessions/${sessionId}/recordings`],
    enabled: !!sessionId
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">{dutch.common.loading}</div>;
  }

  if (recordings.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 space-y-2">
      <h4 className="text-sm font-medium">Opnames:</h4>
      {recordings.map(recording => (
        <div key={recording.id} className="bg-muted/40 p-2 rounded-md">
          <div className="flex items-center gap-2">
            {recording.mediaType === 'video' ? (
              <Video className="h-3 w-3" />
            ) : (
              <Mic className="h-3 w-3" />
            )}
            <span className="text-xs">
              {new Date(recording.startTime).toLocaleTimeString()}
            </span>
          </div>
          
          {/* Display tags if available */}
          {recording.tags && Array.isArray(recording.tags) && recording.tags.length > 0 && (
            <div className="mt-2">
              <h5 className="text-xs font-medium mb-1">Tags:</h5>
              <div className="flex flex-wrap gap-1">
                {recording.tags.map((tag: Tag) => (
                  <span 
                    key={tag.id} 
                    className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded flex items-center gap-1"
                  >
                    <Flag className="h-2 w-2" />
                    {formatTimestamp(tag.timestamp)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function SessionList() {
  const [open, setOpen] = useState(false);
  const { data: sessions = [], isLoading } = useQuery<Session[]>({ 
    queryKey: ["/api/sessions"]
  });

  const form = useForm({
    resolver: zodResolver(insertSessionSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      workshopId: 1, // Temporary default
      notes: "",
    },
  });

  async function onSubmit(data: any) {
    try {
      await apiRequest("POST", "/api/sessions", data);
      queryClient.invalidateQueries({ queryKey: ["/api/sessions"] });
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error(error);
    }
  }

  if (isLoading) {
    return <div className="text-center">{dutch.common.loading}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{dutch.sessions.title}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {dutch.sessions.new}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dutch.sessions.new}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dutch.sessions.date}</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{dutch.sessions.notes}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">{dutch.common.save}</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`}>
            <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardHeader>
                <CardTitle>
                  {new Date(session.date).toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {session.notes || "Geen notities"}
                </p>
                
                {/* Display recordings with tags */}
                <SessionRecordings sessionId={session.id} />
                
                <Button variant="link" className="mt-4">
                  <Mic className="mr-2 h-4 w-4" />
                  Start Opname
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center text-muted-foreground">
          {dutch.common.noData}
        </div>
      )}
    </div>
  );
}
