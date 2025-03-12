import { useState, useRef, useEffect, useCallback } from 'react';
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
import { queryClient } from "@/lib/queryClient";

interface Tag {
  id: string;
  timestamp: number;
  created_at: string;
  screenshot?: string; // Base64 encoded image data
}

interface RecordingInterfaceProps {
  sessionId: number;
  onRecordingComplete: (recordingUrl: string) => void;
}

export default function RecordingInterface({ sessionId, onRecordingComplete }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('video');
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const mediaChunks = useRef<Blob[]>([]);
  const startTime = useRef<Date | null>(null);
  const currentTagsRef = useRef<Tag[]>([]);
  const { toast } = useToast();
  
  // Format time for display (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Capture screenshot from video
  const captureScreenshot = (): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (mediaType !== 'video' || !videoRef.current) {
        resolve(undefined);
        return;
      }

      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        const video = videoRef.current;
        
        // Set canvas dimensions to match the video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the current video frame to the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to base64 data URL (JPEG format for smaller size)
          const dataURL = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          console.log('Screenshot captured successfully');
          resolve(dataURL);
        } else {
          console.error('Failed to get canvas context');
          resolve(undefined);
        }
      } catch (err) {
        console.error('Error capturing screenshot:', err);
        resolve(undefined);
      }
    });
  };

  // Create a stable addTag function with useCallback
  const addTag = useCallback(async () => {
    // Capture screenshot first if it's a video recording
    const screenshot = await captureScreenshot();
    
    const newTag: Tag = {
      id: crypto.randomUUID(),
      timestamp: recordingTime,
      created_at: new Date().toISOString(),
      screenshot: screenshot
    };
    
    // Add tag to state
    const updatedTags = [...tags, newTag];
    setTags(updatedTags);
    
    console.log('Tag added with screenshot:', newTag);
    console.log('Current tags:', updatedTags);
  }, [recordingTime, tags, mediaType]);
  
  // Keep track of the current tags
  useEffect(() => {
    currentTagsRef.current = tags;
    console.log('Updated tags ref:', currentTagsRef.current);
  }, [tags]);

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

  // Reference to the tag button for focusing
  const tagButtonRef = useRef<HTMLButtonElement>(null);

  // Handle keyboard shortcuts for tagging with enhanced logging
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      // Log all key events during recording for debugging
      if (isRecording) {
        console.log('Key pressed:', {
          key: e.key,
          code: e.code,
          keyCode: e.keyCode,
          which: e.which,
          location: e.location,
          repeat: e.repeat,
          ctrlKey: e.ctrlKey,
          altKey: e.altKey,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey
        });
      }
      
      // Support multiple keys for tagging including Bluetooth devices
      if (isRecording && (
          // Standard keys
          e.code === 'AudioVolumeUp' || 
          e.key === 'VolumeUp' ||
          e.key === 'ArrowUp' ||
          e.code === 'ArrowUp' || 
          e.code === 'PageUp' ||
          // Bluetooth and mobile remote keys
          e.keyCode === 175 ||     // VolumeUp
          e.which === 175 ||       // VolumeUp in some browsers
          e.keyCode === 38 ||      // ArrowUp
          e.which === 38           // ArrowUp in some browsers
        )) {
        e.preventDefault();
        console.log('Tag key detected! Adding tag at time:', recordingTime);
        
        // Since addTag is now async, we need to await it
        await addTag();
        
        // Focus the tag button
        if (tagButtonRef.current) {
          tagButtonRef.current.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isRecording, addTag, recordingTime]); // Re-add listener when recording state or addTag changes

  // Update recording timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

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
      
      // Use the currentTagsRef to get the latest tags
      console.log('Tags being sent to server (from ref):', currentTagsRef.current);
      const tagsJSON = JSON.stringify(currentTagsRef.current);
      console.log('Tags JSON:', tagsJSON);
      formData.append('tags', tagsJSON);

      // Send the FormData to the server
      const response = await fetch('/api/recordings/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      // Immediately return to the recording list
      const recordingUrl = URL.createObjectURL(blob);
      onRecordingComplete(recordingUrl);

      // Invalidate queries to refresh the recordings list
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
      
      // Clear tags at the start of a new recording
      setTags([]);
      console.log('Tags reset at start of recording');

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          mediaChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        console.log('Recording stopped, tags at stop time:', currentTagsRef.current);
        
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
      <div className="space-y-2">
        <div className="relative aspect-video bg-slate-950 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Live Tag Markers - Always show container when recording */}
        {isRecording && (
          <div className="bg-slate-100 p-2 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-sm font-medium">Getagde momenten:</h4>
              <span className="text-xs text-gray-500">
                <span className="inline-block bg-gray-200 px-1 rounded">↑</span> voor tag
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                <>
                  {tags.map(tag => (
                    <div 
                      key={tag.id}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      <Flag className="h-3 w-3 mr-1" />
                      {formatTime(tag.timestamp)}
                    </div>
                  ))}
                </>
              ) : (
                <div className="bg-slate-200 text-slate-400 px-3 py-1 rounded-full text-sm flex items-center">
                  <Flag className="h-3 w-3 mr-1" />
                  00:00
                </div>
              )}
            </div>
          </div>
        )}
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
            <Button 
              ref={tagButtonRef}
              onClick={() => addTag()} 
              variant="secondary"
            >
              <Flag className="mr-2 h-4 w-4" />
              Tag Moment
            </Button>
          </>
        )}
      </div>
    </div>
  );
}