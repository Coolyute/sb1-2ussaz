export const parseEvents = (eventString: string): string[] => {
  if (!eventString) return [];

  // Split events by common delimiters (comma, semicolon, newline, and/or)
  const events = eventString
    .split(/[,;\n]|\s+(?:and|or)\s+/i)
    .map(event => event.trim())
    .filter(event => event.length > 0);

  // Remove any duplicates and return
  return [...new Set(events)];
};