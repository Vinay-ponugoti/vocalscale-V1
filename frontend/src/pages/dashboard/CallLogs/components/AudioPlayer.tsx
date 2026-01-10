import React, { useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';

interface AudioPlayerProps {
  duration: number; // in seconds
  src?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ duration, src }) => {
  const [playing, setPlaying] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate stable waveform once on mount
  const [waveform] = useState(() => {
    return [...Array(40)].map(() => Math.max(20, Math.random() * 100));
  });

  return (
    <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 ring-1 ring-slate-900/5">
      <Button 
        size="icon"
        onClick={() => {
           setPlaying(!playing);
           if (src) console.log('Playing:', src);
        }}
        className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-100 ring-1 ring-indigo-500/20"
      >
        {playing ? (
          <Pause size={16} fill="currentColor" />
        ) : (
          <Play size={16} fill="currentColor" className="ml-0.5" />
        )}
      </Button>
      
      <span className="text-[11px] font-black text-slate-400 min-w-[32px] uppercase tracking-tighter">
        {playing ? "0:12" : "0:00"}
      </span>
      
      <div className="flex-1 flex items-center gap-[3px] h-7">
        {waveform.map((height, i) => (
           <div 
             key={i} 
             className={`w-[3px] rounded-full transition-all duration-500 ${playing && i < 15 ? 'bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.4)]' : 'bg-slate-100'}`} 
             style={{ height: `${height}%` }}
           ></div>
        ))}
      </div>
      
      <span className="text-[11px] font-black text-slate-400 min-w-[32px] text-right uppercase tracking-tighter">
        {formatTime(duration)}
      </span>
    </div>
  );
};

export default AudioPlayer;
