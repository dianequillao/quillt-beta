import React from 'react';
import { Overlap } from '../types';
import { Sparkles, MessageCircle } from 'lucide-react';

interface OverlapCardProps {
  overlap: Overlap;
}

export const OverlapCard: React.FC<OverlapCardProps> = ({ overlap }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="bg-gradient-to-r from-quillt-500 to-quillt-600 rounded-xl p-4 shadow-lg mb-6 text-white relative overflow-hidden">
      {/* Decorative background circle */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl pointer-events-none"></div>

      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 p-1.5 rounded-full">
                <Sparkles size={16} className="text-yellow-300" />
            </div>
            <span className="font-bold text-sm tracking-wide uppercase opacity-90">It's a Match!</span>
        </div>
      </div>

      <div className="mt-2">
        <h3 className="text-lg font-bold leading-tight mb-1">
          You & {overlap.userB.name.split(' ')[0]} are both in {overlap.city.split(',')[0]}!
        </h3>
        <p className="text-quillt-100 text-sm mb-4">
          Overlapping from {formatDate(overlap.overlapStart)} to {formatDate(overlap.overlapEnd)}
        </p>

        <button className="w-full bg-white text-quillt-600 font-semibold py-2 px-4 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors">
          <MessageCircle size={16} />
          Coordinate Meetup
        </button>
      </div>
    </div>
  );
};