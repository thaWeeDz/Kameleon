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

interface RecordingInterfaceProps {
  sessionId: number;
}

export default function RecordingInterface({ sessionId }: RecordingInterfaceProps) {
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('video');
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: true 
      });

      if (videoRef.current) {
        console.log('Setting video stream...');
        videoRef.current.srcObject = stream;
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

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Select
          defaultValue={mediaType}
          onValueChange={(value: 'audio' | 'video') => setMediaType(value)}
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
      </div>

      <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          id="camera"
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={startCamera} className="flex-1">
          <Video className="mr-2 h-4 w-4" />
          Start Camera
        </Button>
      </div>
    </div>
  );
}