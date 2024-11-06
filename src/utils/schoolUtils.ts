export const normalizeSchoolName = (name: string): string => {
  return name.toLowerCase()
    .replace(/['\u2018\u2019]/g, '') // Remove all types of apostrophes
    .replace(/[^a-z0-9]/g, ' ') // Replace any non-alphanumeric char with space
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*(primary|prep|academy|school|high|elementary|junior|senior)\s*/g, '') // Remove common school type words
    .replace(/\s*(st|saint)\s+/g, 'st ') // Standardize Saint/St.
    .trim();
};

export const findMatchingSchool = (schoolName: string, schools: any[]) => {
  const normalizedInputName = normalizeSchoolName(schoolName);
  
  // First try exact match after normalization
  const exactMatch = schools.find(s => normalizeSchoolName(s.name) === normalizedInputName);
  if (exactMatch) return exactMatch;

  // Then try partial match
  const partialMatch = schools.find(s => {
    const normalizedSchoolName = normalizeSchoolName(s.name);
    return normalizedSchoolName.includes(normalizedInputName) || 
           normalizedInputName.includes(normalizedSchoolName);
  });
  if (partialMatch) return partialMatch;

  // Try matching with common variations
  const variations = [
    normalizedInputName,
    normalizedInputName.replace(/\s/g, ''), // Remove all spaces
    ...normalizedInputName.split(' ') // Individual words
  ];

  for (const school of schools) {
    const normalizedSchoolName = normalizeSchoolName(school.name);
    for (const variation of variations) {
      if (normalizedSchoolName.includes(variation) && variation.length > 3) {
        return school;
      }
    }
  }

  return null;
};