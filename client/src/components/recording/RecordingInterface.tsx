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
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (videoRef.current && stream && mediaType === 'video') {
      videoRef.current.srcObject = stream;
    }
  }, [stream, mediaType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkMediaSupport = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media devices niet ondersteund in deze browser.');
    }
  };

  const setupMediaStream = async () => {
    try {
      await checkMediaSupport();

      // Stop any existing streams
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      console.log(`Requesting ${mediaType} permissions...`);
      const constraints = {
        audio: true,
        video: mediaType === 'video' ? {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Permission granted, stream obtained');

      setStream(newStream);
      return newStream;
    } catch (error: any) {
      console.error('Error accessing media devices:', error);
      let errorMessage = 'Er is een fout opgetreden bij het openen van de media apparaten.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Toegang tot microfoon/camera is geweigerd. Geef toestemming in je browser om op te nemen.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = `Geen ${mediaType === 'video' ? 'camera' : 'microfoon'} gevonden.`;
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = `Kan geen toegang krijgen tot de ${mediaType === 'video' ? 'camera' : 'microfoon'}. Mogelijk wordt deze al door een andere applicatie gebruikt.`;
      }

      toast({
        title: "Fout bij opname starten",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      console.log('Starting recording setup...');
      const mediaStream = await setupMediaStream();

      if (!MediaRecorder.isTypeSupported('video/webm') && !MediaRecorder.isTypeSupported('audio/webm')) {
        throw new Error('WebM format wordt niet ondersteund in deze browser.');
      }

      mediaRecorder.current = new MediaRecorder(mediaStream);
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

          const recordingData = await response.json();
          console.log('Recording saved:', recordingData);

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

      console.log('Starting MediaRecorder...');
      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
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
          defaultValue={mediaType}
          onValueChange={(value: 'audio' | 'video') => {
            setMediaType(value);
            if (isRecording) {
              stopRecording();
            }
          }}
          disabled={isRecording}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Selecteer type" />
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

      {mediaType === 'video' && (
        <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden">
          {stream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
              <Video className="w-12 h-12" />
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        {!isRecording ? (
          <Button onClick={startRecording} className="flex-1">
            {mediaType === 'video' ? <Video className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
            Start Opname
          </Button>
        ) : (
          <>
            <Button onClick={stopRecording} variant="destructive" className="flex-1">
              <Square className="mr-2 h-4 w-4" />
              Stop Opname
            </Button>
            <Button onClick={tagMoment} variant="outline">
              <Flag className="mr-2 h-4 w-4" />
              Markeer Moment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}