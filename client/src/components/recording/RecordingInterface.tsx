import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Video, Square, Play, Flag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface Tag {
  id: string;
  timestamp: number;
  created_at: string;
}

interface RecordingInterfaceProps {
  sessionId: number;
}

export default function RecordingInterface({ sessionId }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('video');
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const startTime = useRef<Date | null>(null);
  const { toast } = useToast();

  // Initialize camera on component mount
  useEffect(() => {
    startCamera();
    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

  const addTag = () => {
    const newTag: Tag = {
      id: crypto.randomUUID(),
      timestamp: recordingTime,
      created_at: new Date().toISOString()
    };
    setTags(prevTags => [...prevTags, newTag]);
    toast({
      title: "Moment getagd",
      description: `Tijdstip ${formatTime(recordingTime)} gemarkeerd`,
    });
  };

  const startCamera = async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      console.log('Requesting camera access...');
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: mediaType === 'video',
        audio: true
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const saveRecording = async (blob: Blob) => {
    try {
      // Create a FormData object to send the blob
      const formData = new FormData();
      formData.append('media', blob, `recording-${Date.now()}.webm`);
      formData.append('sessionId', sessionId.toString());
      formData.append('startTime', startTime.current?.toISOString() || new Date().toISOString());
      formData.append('endTime', new Date().toISOString());
      formData.append('mediaType', mediaType);
      formData.append('status', 'completed');
      formData.append('tags', JSON.stringify(tags));

      // Send the FormData to the server
      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      // Create a URL for immediate playback
      const recordingUrl = URL.createObjectURL(blob);
      setRecordedVideoUrl(recordingUrl);

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

  const startRecording = async () => {
    if (!stream) {
      await startCamera();
    }

    try {
      mediaRecorder.current = new MediaRecorder(stream!);
      mediaChunks.current = [];
      startTime.current = new Date();
      setTags([]); // Reset tags when starting new recording

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(mediaChunks.current, {
          type: mediaType === 'video' ? 'video/webm' : 'audio/webm'
        });
        await saveRecording(blob);
      };

      mediaRecorder.current.start(1000); // Capture data every second
      setIsRecording(true);
      setRecordingTime(0);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Fout",
        description: "Er is een fout opgetreden bij het starten van de opname.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Select
          defaultValue={mediaType}
          onValueChange={(value: 'audio' | 'video') => {
            setMediaType(value);
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              setStream(null);
              startCamera(); // Restart camera with new settings
            }
          }}
          disabled={isRecording}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="video">
              <div className="flex items-center">
                <Video className="w-4 h-4 mr-2" />
                Video
              </div>
            </SelectItem>
            <SelectItem value="audio">
              <div className="flex items-center">
                <Mic className="w-4 h-4 mr-2" />
                Audio
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        {isRecording && (
          <div className="text-xl font-mono text-red-500">
            {formatTime(recordingTime)}
          </div>
        )}
      </div>

      {/* Live Preview */}
      <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Recording Controls */}
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
            <Button onClick={addTag} variant="secondary">
              <Flag className="mr-2 h-4 w-4" />
              Tag Moment
            </Button>
          </>
        )}
      </div>

      {/* Playback Section */}
      {recordedVideoUrl && (
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Laatste Opname</h3>
          <div className="mt-2">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Tags:</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <div key={tag.id} className="text-sm bg-secondary px-2 py-1 rounded-md">
                  {formatTime(tag.timestamp)}
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden">
            <video
              ref={playbackRef}
              src={recordedVideoUrl}
              controls
              className="w-full h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}