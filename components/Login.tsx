import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { User } from '../types';
import { Plane, ArrowRight, Loader2, Lock, User as UserIcon } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  isDemoMode: boolean;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, isDemoMode }) => {
  const [handle, setHandle] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle || pin.length < 4) {
      setError("Please enter a nickname and a 4-digit PIN.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const normalizedHandle = handle.trim();
      
      // DEMO MODE (No Firebase)
      if (isDemoMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockUser: User = {
          id: `demo-${Date.now()}`,
          name: normalizedHandle,
          handle: '@' + normalizedHandle.toLowerCase().replace(/\s+/g, '_'),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedHandle}`,
        };
        onLoginSuccess(mockUser);
        return;
      }

      // REAL MODE (Firebase)
      if (!db) {
        setError("Database connection failed.");
        setLoading(false);
        return;
      }

      const usersRef = collection(db, 'users');
      // Query by lowercase name to ensure uniqueness case-insensitively
      const q = query(usersRef, where('handle_normalized', '==', normalizedHandle.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // --- CREATE NEW USER ---
        const newUser: User = {
          id: '', // Will be set by Firestore doc ID
          name: normalizedHandle,
          handle: '@' + normalizedHandle.toLowerCase().replace(/\s+/g, '_'),
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${normalizedHandle}`,
        };

        const docRef = await addDoc(usersRef, {
          ...newUser,
          handle_normalized: normalizedHandle.toLowerCase(),
          pin: pin // In a real app, hash this! For MVP, plaintext is fine for friend groups.
        });

        onLoginSuccess({ ...newUser, id: docRef.id });
      } else {
        // --- LOGIN EXISTING USER ---
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        if (userData.pin === pin) {
          onLoginSuccess({
            id: userDoc.id,
            name: userData.name,
            handle: userData.handle,
            avatar: userData.avatar
          });
        } else {
          setError("Incorrect PIN. If this is you, try again.");
        }
      }

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-quillt-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-quillt-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-8 transform -rotate-6">
          <Plane size={40} className="text-quillt-600" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Quillt.</h1>
        <p className="text-slate-500 mb-8 text-sm uppercase tracking-widest font-semibold">
          Private Friends Beta
        </p>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 space-y-4">
          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Nickname</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="e.g. Jack, Sarah, Chen"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-quillt-500 focus:ring-2 focus:ring-quillt-200 outline-none transition-all font-medium"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
              />
            </div>
          </div>

          <div className="text-left">
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1 ml-1">Secret PIN</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
              <input 
                type="text" 
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                placeholder="4-digit code"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-quillt-500 focus:ring-2 focus:ring-quillt-200 outline-none transition-all font-medium tracking-widest"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 ml-1">
              Remember this! You'll need it to log back in.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <span>Enter App</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};