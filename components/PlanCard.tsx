import React from 'react';
import { Plan, User, Overlap } from '../types';
import { Calendar, MapPin, Sparkles } from 'lucide-react';

interface PlanCardProps {
  plan: Plan;
  user: User;
  isOwner: boolean;
  overlaps?: Overlap[];
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, user, isOwner, overlaps }) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const hasOverlaps = overlaps && overlaps.length > 0;

  return (
    <div className={`bg-white rounded-xl p-4 shadow-sm border mb-4 transition-all ${hasOverlaps ? 'border-quillt-accent/30 ring-1 ring-quillt-accent/10' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3 mb-3">
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-10 h-10 rounded-full object-cover border border-slate-200"
        />
        <div>
          <h4 className="font-semibold text-slate-900 text-sm">{user.name}</h4>
          <p className="text-slate-500 text-xs">{user.handle}</p>
        </div>
        {isOwner && (
          <span className="ml-auto text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
            You
          </span>
        )}
      </div>

      <div className="pl-13">
        <div className="flex items-center gap-2 text-quillt-900 font-bold text-lg mb-1">
          <MapPin size={18} className="text-quillt-500" />
          {plan.location}
        </div>
        
        <div className="flex items-center gap-2 text-slate-600 text-sm mb-3">
          <Calendar size={16} />
          <span>{formatDate(plan.startDate)} – {formatDate(plan.endDate)}</span>
        </div>

        {plan.description && (
          <p className="text-slate-600 text-sm italic bg-slate-50 p-2 rounded-lg border-l-2 border-quillt-200 mb-3">
            "{plan.description}"
          </p>
        )}

        {/* Overlap Section - The Delight Moment */}
        {hasOverlaps && (
          <div className="mt-4 bg-gradient-to-br from-violet-50 to-white rounded-xl p-3 border border-violet-100 shadow-sm relative overflow-hidden group">
             {/* Decorative glitter */}
             <div className="absolute top-0 right-0 p-1 opacity-10">
                <Sparkles size={40} className="text-quillt-accent" />
             </div>

            <div className="flex items-center gap-2 mb-2 text-quillt-accent relative z-10">
              <Sparkles size={14} className="fill-current animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Overlap Detected!</span>
            </div>
            
            <div className="space-y-2 relative z-10">
              {overlaps.map((overlap, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/60 p-2 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-sm text-slate-800">
                    <img src={overlap.userB.avatar} className="w-6 h-6 rounded-full border border-white shadow-sm" alt="" />
                    <span className="font-semibold">{overlap.userB.name}</span>
                  </div>
                  <span className="text-quillt-600 text-xs font-medium bg-quillt-50 px-2 py-1 rounded-md">
                     {formatDate(overlap.overlapStart)} - {formatDate(overlap.overlapEnd)}
                  </span>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-2 text-xs font-semibold text-quillt-accent hover:text-violet-700 py-1 text-center transition-colors">
              Message to Coordinate →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};