import React, { useState } from 'react';
import { X, Wand2, Loader2 } from 'lucide-react';
import { generateTripVibe } from '../services/geminiService';

interface CreatePlanModalProps {
  onClose: () => void;
  onSubmit: (data: { location: string; startDate: string; endDate: string; description: string }) => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ onClose, onSubmit }) => {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location && startDate && endDate) {
      onSubmit({ location, startDate, endDate, description });
    }
  };

  const handleMagicFill = async () => {
    if (!location) return;
    setIsGenerating(true);
    const vibe = await generateTripVibe(location);
    setDescription(vibe);
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900">Add Upcoming Trip</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Where are you going?</label>
            <input
              type="text"
              required
              placeholder="e.g. New York, Paris, Austin"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-quillt-500 focus:ring-2 focus:ring-quillt-200 outline-none transition-all"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-quillt-500 focus:ring-2 focus:ring-quillt-200 outline-none transition-all"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-quillt-500 focus:ring-2 focus:ring-quillt-200 outline-none transition-all"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Vibe / Notes (Optional)</label>
              <button 
                type="button" 
                onClick={handleMagicFill}
                disabled={!location || isGenerating}
                className="text-xs font-semibold text-quillt-600 flex items-center gap-1 hover:text-quillt-800 disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                AI Suggest
              </button>
            </div>
            <textarea
              rows={2}
              placeholder="Work, fun, or a bit of both..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-quillt-500 focus:ring-2 focus:ring-quillt-200 outline-none transition-all resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all mt-4"
          >
            Share Plan
          </button>
        </form>
      </div>
    </div>
  );
};