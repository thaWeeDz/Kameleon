import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Video, Square, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface RecordingInterfaceProps {
  sessionId: number;
}

export default function RecordingInterface({ sessionId }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio');
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const startTime = useRef<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: mediaType === 'video'
      });

      mediaRecorder.current = new MediaRecorder(stream);
      mediaChunks.current = [];
      startTime.current = new Date();

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(mediaChunks.current, {
          type: mediaType === 'video' ? 'video/webm' : 'audio/webm'
        });

        try {
          const response = await apiRequest("POST", "/api/recordings", {
            sessionId,
            startTime: startTime.current?.toISOString(),
            endTime: new Date().toISOString(),
            mediaType,
            status: "ready"
          });

          // Make sure we're dealing with the actual response data
          const recordingData = await response.json();

          queryClient.invalidateQueries({ 
            queryKey: [`/api/sessions/${sessionId}/recordings`] 
          });

          toast({
            title: "Opname voltooid",
            description: "De opname is succesvol opgeslagen.",
          });
        } catch (error) {
          console.error('Error saving recording:', error);
          toast({
            title: "Fout",
            description: "Er is een fout opgetreden bij het opslaan van de opname.",
            variant: "destructive",
          });
        }
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);

    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Toegang geweigerd",
        description: "Geef toegang tot je microfoon/camera om op te nemen.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const tagMoment = async () => {
    if (!isRecording || !startTime.current) return;

    try {
      const response = await apiRequest("GET", `/api/recordings/${sessionId}/current`);
      const currentRecording = await response.json();

      await apiRequest("POST", "/api/moments", {
        recordingId: currentRecording.id,
        timestamp: new Date().toISOString(),
        note: "Gemarkeerd tijdens opname"
      });

      toast({
        title: "Moment gemarkeerd",
        description: "Het moment is succesvol gemarkeerd.",
      });
    } catch (error) {
      console.error('Error tagging moment:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het markeren van het moment.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Select
          value={mediaType}
          onValueChange={(value: 'audio' | 'video') => setMediaType(value)}
          disabled={isRecording}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="audio">
              <div className="flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Audio
              </div>
            </SelectItem>
            <SelectItem value="video">
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Video
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <div className="text-2xl font-mono">
          {formatTime(recordingTime)}
        </div>
      </div>

      <div className="flex gap-2">
        {!isRecording ? (
          <Button onClick={startRecording} className="flex-1">
            {mediaType === 'video' ? <Video className="mr-2" /> : <Mic className="mr-2" />}
            Start Opname
          </Button>
        ) : (
          <>
            <Button onClick={stopRecording} variant="destructive" className="flex-1">
              <Square className="mr-2" />
              Stop Opname
            </Button>
            <Button onClick={tagMoment} variant="outline">
              <Flag className="mr-2" />
              Markeer Moment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}