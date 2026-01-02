function rangeOverlap(min1, max1, min2, max2) {
  return Math.max(0, Math.min(max1, max2) - Math.max(min1, min2));
}

function daysDiff(a, b) {
  return Math.abs(
    (new Date(a).getTime() - new Date(b).getTime()) /
      (1000 * 60 * 60 * 24)
  );
}

export const calculateCompatibility = (a, b) => {
  let score = 0;

  // Budget (25)
  if (rangeOverlap(a.budgetMin, a.budgetMax, b.budgetMin, b.budgetMax) > 0) {
    score += 25;
  }

  // Areas (20)
  if (a.preferredAreas.some((x) => b.preferredAreas.includes(x))) {
    score += 20;
  }

  // Lifestyle (35)
  if (a.sleepHabit === b.sleepHabit) score += 8;
  if (a.cleanliness === b.cleanliness) score += 8;
  if (a.smoking === b.smoking) score += 6;
  if (a.drinking === b.drinking) score += 6;
  if (a.pets === b.pets) score += 4;
  if (a.socialVibe === b.socialVibe) score += 3;

  // Age (10)
  const ageDiff = Math.abs(a.age - b.age);
  if (ageDiff <= 2) score += 10;
  else if (ageDiff <= 5) score += 6;
  else if (ageDiff <= 8) score += 3;

  // Move-in date (10)
  if (a.moveInDate && b.moveInDate) {
    const diff = daysDiff(a.moveInDate, b.moveInDate);
    if (diff <= 7) score += 10;
    else if (diff <= 15) score += 6;
    else if (diff <= 30) score += 3;
  }

  return Math.min(score, 100);
};
