import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Home, Map as MapIcon, User as UserIcon, LogOut } from 'lucide-react';
import { Plan, ViewState, User } from './types';
import { calculateOverlaps } from './utils';
import { PlanCard } from './components/PlanCard';
import { OverlapCard } from './components/OverlapCard';
import { CreatePlanModal } from './components/CreatePlanModal';
import { Login } from './components/Login';
import { db, isFirebaseReady } from './firebase';
import { collection, addDoc, onSnapshot, query, orderBy, getDoc, doc } from 'firebase/firestore';
import { INITIAL_PLANS, CURRENT_USER as MOCK_USER, FRIENDS as MOCK_FRIENDS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [view, setView] = useState<ViewState>(ViewState.FEED);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // SESSION MANAGEMENT
  useEffect(() => {
    const checkSession = async () => {
      // 1. Check LocalStorage
      const storedUserId = localStorage.getItem('quillt_user_id');
      
      if (storedUserId) {
        if (isFirebaseReady && db) {
          // Real Mode: Fetch user from DB
          try {
            const userDoc = await getDoc(doc(db, "users", storedUserId));
            if (userDoc.exists()) {
              setUser({ id: userDoc.id, ...userDoc.data() } as User);
            } else {
              // User ID in local storage but not in DB (maybe DB was wiped)
              localStorage.removeItem('quillt_user_id');
            }
          } catch (e) {
            console.error("Error restoring session:", e);
          }
        } else {
          // Demo Mode: Restore mock user if ID matches
          if (storedUserId === MOCK_USER.id) {
            setUser(MOCK_USER);
            setPlans(INITIAL_PLANS);
          }
        }
      } else {
        // No session found
        if (!isFirebaseReady) {
            // In demo mode without session, we don't auto-login, we wait for login screen
            // but for dev convenience, uncomment below to auto-login as Diane
            // setUser(MOCK_USER);
            // setPlans(INITIAL_PLANS);
        }
      }
      
      setIsLoading(false);
    };

    checkSession();
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('quillt_user_id', loggedInUser.id);
    
    // If we are in demo mode, load initial plans
    if (!isFirebaseReady) {
      setPlans(INITIAL_PLANS);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('quillt_user_id');
    setView(ViewState.FEED);
  };

  // DATA LISTENER (Only runs when user is logged in)
  useEffect(() => {
    if (!user) return;
    
    // DEMO MODE
    if (!isFirebaseReady) {
        setPlans(INITIAL_PLANS);
        return;
    }

    // REAL MODE
    if (db) {
        const q = query(collection(db, "plans"), orderBy("startDate", "asc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedPlans: Plan[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as Plan[];
        setPlans(fetchedPlans);
        });
        return () => unsubscribe();
    }
  }, [user]);

  // Derived state: My plans
  const myPlans = useMemo(() => 
    plans.filter(p => p.userId === user?.id).sort((a, b) => a.startDate.localeCompare(b.startDate)),
  [plans, user]);

  // Derived state: Friend plans
  const friendPlans = useMemo(() => 
    plans.filter(p => p.userId !== user?.id).sort((a, b) => a.startDate.localeCompare(b.startDate)),
  [plans, user]);

  // NOTE: For Overlaps to work nicely in MVP, we construct a 'User' object on the fly for the friend
  const distinctFriends = useMemo(() => {
     const friendMap = new Map<string, User>();
     if (!isFirebaseReady) {
       MOCK_FRIENDS.forEach(f => friendMap.set(f.id, f));
     }
     
     plans.forEach(p => {
       if (p.userId !== user?.id) {
         if (!friendMap.has(p.userId)) {
             friendMap.set(p.userId, {
                 id: p.userId,
                 name: (p as any).authorName || 'Friend',
                 avatar: (p as any).authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.userId}`,
                 handle: (p as any).authorHandle || '@friend'
             });
         }
       }
     });
     return Array.from(friendMap.values());
  }, [plans, user]);

  const overlaps = useMemo(() => 
    calculateOverlaps(myPlans, plans, distinctFriends),
  [myPlans, plans, distinctFriends]);

  const handleCreatePlan = async (data: { location: string; startDate: string; endDate: string; description: string }) => {
    if (!user) return;

    const newPlanData = {
      userId: user.id,
      location: data.location,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      isPrivate: false,
      authorName: user.name,
      authorAvatar: user.avatar,
      authorHandle: user.handle
    };

    if (isFirebaseReady && db) {
      await addDoc(collection(db, "plans"), newPlanData);
    } else {
      const newPlan: Plan = {
        id: `p${Date.now()}`,
        ...newPlanData
      };
      setPlans(prev => [...prev, newPlan]);
    }
    
    setIsModalOpen(false);
    setView(ViewState.MY_PLANS);
  };

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="animate-pulse flex flex-col items-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full mb-4"></div>
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
              </div>
          </div>
      )
  }

  // Show Login if not authenticated
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} isDemoMode={!isFirebaseReady} />;
  }

  const renderContent = () => {
    if (view === ViewState.PROFILE) {
      return (
        <div className="flex flex-col items-center justify-center pt-10 text-slate-500">
           <div className="w-24 h-24 rounded-full bg-slate-200 mb-4 overflow-hidden border-4 border-white shadow-sm">
             <img src={user.avatar} alt="Me" className="w-full h-full object-cover" />
           </div>
           <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
           <p className="mb-6">{user.handle}</p>
           
           <div className="w-full max-w-xs space-y-3">
               <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                   <span className="text-sm font-medium">Trips Planned</span>
                   <span className="font-bold text-slate-900">{myPlans.length}</span>
               </div>
               <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                   <span className="text-sm font-medium">Overlaps Found</span>
                   <span className="font-bold text-quillt-600">{overlaps.length}</span>
               </div>
           </div>

           <button 
             onClick={handleSignOut}
             className="mt-8 flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      );
    }

    if (view === ViewState.MY_PLANS) {
      return (
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">My Upcoming Trips</h2>
          {myPlans.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
              <p>No plans yet.</p>
              <button onClick={() => setIsModalOpen(true)} className="text-quillt-600 font-semibold mt-2 hover:underline">Add your first trip</button>
            </div>
          ) : (
            myPlans.map(plan => {
              const planOverlaps = overlaps.filter(o => o.planA.id === plan.id);
              return (
                <PlanCard 
                  key={plan.id} 
                  plan={plan} 
                  user={user} 
                  isOwner={true}
                  overlaps={planOverlaps}
                />
              );
            })
          )}
        </div>
      );
    }

    // FEED VIEW
    return (
      <div className="pb-24">
        {overlaps.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Happening Soon</h2>
            {overlaps.map((overlap, idx) => (
              <OverlapCard key={`overlap-${idx}`} overlap={overlap} />
            ))}
          </div>
        )}

        <h2 className="text-xl font-bold text-slate-900 mb-4 px-1">Friend Activity</h2>
        {friendPlans.length === 0 ? (
             <div className="text-center py-10 text-slate-400">
                <p>No friend plans yet.</p>
                <p className="text-sm">Invite friends to see their trips here!</p>
             </div>
        ) : (
            friendPlans.map(plan => {
            let friend = distinctFriends.find(f => f.id === plan.userId);
            
            // Fallback if the plan has embedded author data
            if (!friend && (plan as any).authorName) {
                friend = {
                    id: plan.userId,
                    name: (plan as any).authorName,
                    avatar: (plan as any).authorAvatar,
                    handle: (plan as any).authorHandle || '@friend'
                };
            }

            if (!friend) return null;
            
            return (
                <PlanCard 
                key={plan.id} 
                plan={plan} 
                user={friend} 
                isOwner={false} 
                />
            );
            })
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-quillt-100">
      
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-black text-quillt-900 tracking-tight">Quillt.</h1>
        <div className="flex items-center gap-3">
             <div className="hidden sm:block text-right">
                 <p className="text-xs font-bold text-slate-900">{user.name}</p>
                 <p className="text-[10px] text-slate-500">{user.handle}</p>
             </div>
            <button onClick={() => setView(ViewState.PROFILE)} className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 transition-transform active:scale-95">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-lg mx-auto p-4 animate-in fade-in duration-300">
        {renderContent()}
      </main>

      {/* Floating Action Button (Mobile Primary Action) */}
      <div className="fixed bottom-20 right-4 z-40 md:hidden">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-xl hover:bg-slate-800 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 z-40 pb-safe">
        <div className="max-w-lg mx-auto grid grid-cols-3 h-16">
          <button 
            onClick={() => setView(ViewState.FEED)}
            className={`flex flex-col items-center justify-center gap-1 ${view === ViewState.FEED ? 'text-quillt-600' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
          >
            <Home size={22} strokeWidth={view === ViewState.FEED ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Feed</span>
          </button>
          
          <button 
            onClick={() => setView(ViewState.MY_PLANS)}
            className={`flex flex-col items-center justify-center gap-1 ${view === ViewState.MY_PLANS ? 'text-quillt-600' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
          >
            <MapIcon size={22} strokeWidth={view === ViewState.MY_PLANS ? 2.5 : 2} />
            <span className="text-[10px] font-medium">My Plans</span>
          </button>

          <button 
            onClick={() => setView(ViewState.PROFILE)}
            className={`flex flex-col items-center justify-center gap-1 ${view === ViewState.PROFILE ? 'text-quillt-600' : 'text-slate-400 hover:text-slate-600'} transition-colors`}
          >
            <UserIcon size={22} strokeWidth={view === ViewState.PROFILE ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
        </div>
      </nav>

      {/* Create Plan Modal */}
      {isModalOpen && (
        <CreatePlanModal 
          onClose={() => setIsModalOpen(false)} 
          onSubmit={handleCreatePlan} 
        />
      )}
      
      {/* Desktop FAB alternate */}
      <div className="hidden md:block fixed bottom-24 right-[calc(50%-14rem)] translate-x-12 z-40">
         <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white p-4 rounded-full shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 pr-6"
        >
          <Plus size={24} />
          <span className="font-semibold">Add Trip</span>
        </button>
      </div>

    </div>
  );
};

export default App;