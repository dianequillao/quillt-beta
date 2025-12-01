import { Plan, Overlap, User } from './types';

// Simple check if two date ranges overlap
const dateRangesOverlap = (startA: string, endA: string, startB: string, endB: string) => {
  return (startA <= endB) && (endA >= startB);
};

// Normalize city strings loosely (e.g. "NYC" == "New York")
// For this MVP, we will use simple inclusion or direct match
const isSameCity = (locA: string, locB: string) => {
  const a = locA.toLowerCase();
  const b = locB.toLowerCase();
  if (a === b) return true;
  if (a.includes('new york') && b.includes('new york')) return true;
  if (a.includes('sf') && b.includes('san francisco')) return true;
  if (b.includes('sf') && a.includes('san francisco')) return true;
  return false;
};

export const calculateOverlaps = (currentUserPlans: Plan[], allPlans: Plan[], friends: User[]): Overlap[] => {
  const overlaps: Overlap[] = [];

  currentUserPlans.forEach(myPlan => {
    allPlans.forEach(otherPlan => {
      // Don't compare with self
      if (otherPlan.userId === myPlan.userId) return;

      const friend = friends.find(f => f.id === otherPlan.userId);
      if (!friend) return;

      if (isSameCity(myPlan.location, otherPlan.location)) {
        if (dateRangesOverlap(myPlan.startDate, myPlan.endDate, otherPlan.startDate, otherPlan.endDate)) {
          // Calculate the specific overlap window
          const overlapStart = myPlan.startDate > otherPlan.startDate ? myPlan.startDate : otherPlan.startDate;
          const overlapEnd = myPlan.endDate < otherPlan.endDate ? myPlan.endDate : otherPlan.endDate;

          overlaps.push({
            planA: myPlan,
            planB: otherPlan,
            userB: friend,
            overlapStart,
            overlapEnd,
            city: myPlan.location
          });
        }
      }
    });
  });

  return overlaps;
};