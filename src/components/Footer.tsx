import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-aura-border bg-aura-base py-4 px-6">
      <div className="max-w-[1600px] mx-auto flex items-center justify-between text-2xs text-aura-textMuted">
        <div className="flex items-center gap-2">
          <span>AURA Terminal</span>
          <span className="text-aura-border">·</span>
          <span>MIT License</span>
          <span className="text-aura-border">·</span>
          <span>CC0 Data</span>
        </div>
        <div className="flex items-center gap-1">
          Built with <Heart size={10} className="text-aura-red" /> by the open source community
        </div>
      </div>
    </footer>
  );
};
