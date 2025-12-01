export interface User {
  id: string;
  name: string;
  avatar: string;
  handle: string;
}

export interface Plan {
  id: string;
  userId: string;
  location: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  description?: string;
  isPrivate: boolean;
}

export interface Overlap {
  planA: Plan; // The current user's plan
  planB: Plan; // The friend's plan
  userB: User; // The friend details
  overlapStart: string;
  overlapEnd: string;
  city: string;
}

export enum ViewState {
  FEED = 'FEED',
  MY_PLANS = 'MY_PLANS',
  PROFILE = 'PROFILE'
}