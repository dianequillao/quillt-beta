import { User, Plan } from './types';

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Diane Q.',
  handle: '@diane_q',
  avatar: 'https://picsum.photos/seed/diane/200/200',
};

export const FRIENDS: User[] = [
  {
    id: 'u2',
    name: 'Jack S.',
    handle: '@jack_travels',
    avatar: 'https://picsum.photos/seed/jack/200/200',
  },
  {
    id: 'u3',
    name: 'Sarah M.',
    handle: '@sarah_mba',
    avatar: 'https://picsum.photos/seed/sarah/200/200',
  },
  {
    id: 'u4',
    name: 'Chen L.',
    handle: '@chen_tech',
    avatar: 'https://picsum.photos/seed/chen/200/200',
  },
];

// Initial mock plans to demonstrate overlap logic immediately
export const INITIAL_PLANS: Plan[] = [
  // Friend Plans
  {
    id: 'p1',
    userId: 'u2', // Jack
    location: 'New York, NY',
    startDate: '2024-06-10',
    endDate: '2024-06-15',
    description: 'Work conference + hanging out',
    isPrivate: false,
  },
  {
    id: 'p2',
    userId: 'u3', // Sarah
    location: 'San Francisco, CA',
    startDate: '2024-07-01',
    endDate: '2024-07-05',
    description: 'Visiting family',
    isPrivate: false,
  },
  {
    id: 'p3',
    userId: 'u4', // Chen
    location: 'London, UK',
    startDate: '2024-08-10',
    endDate: '2024-08-20',
    description: 'Summer break!',
    isPrivate: false,
  },
  // Overlapping Friend Plan (Double overlap possibility)
  {
    id: 'p4',
    userId: 'u3', // Sarah is also going to NY when Jack is there?
    location: 'New York, NY',
    startDate: '2024-06-12',
    endDate: '2024-06-18',
    description: 'Recruiting event',
    isPrivate: false,
  },
  // My Plans (Diane)
  {
    id: 'p5',
    userId: 'u1',
    location: 'San Francisco, CA',
    startDate: '2024-05-20',
    endDate: '2024-05-25',
    description: 'Quick client meeting',
    isPrivate: false,
  }
];