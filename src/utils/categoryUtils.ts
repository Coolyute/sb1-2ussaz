export const parseAgeCategory = (category: string): 'U9' | 'U11' | 'U13' | 'U15' | 'Open' => {
  const normalized = category.toUpperCase().trim();
  
  // Check for Open category variations
  if (normalized.includes('OPEN') || 
      normalized.includes('BOYS OPEN') || 
      normalized.includes('GIRLS OPEN')) {
    return 'Open';
  }
  
  // Check for specific age groups
  if (normalized.includes('U9')) return 'U9';
  if (normalized.includes('U11')) return 'U11';
  if (normalized.includes('U13')) return 'U13';
  if (normalized.includes('U15')) return 'U15';
  
  // Default to Open if no specific age group is found
  return 'Open';
};