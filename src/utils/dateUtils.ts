export const formatExcelDate = (date: any): string => {
  // Handle Excel serial date number
  if (typeof date === 'number') {
    // Excel's epoch starts from 1900-01-01, adjust for the difference
    const excelEpoch = new Date(1900, 0, 1);
    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    const dateValue = new Date(excelEpoch.getTime() + (date - 1) * millisecondsPerDay);
    return dateValue.toISOString().split('T')[0];
  }
  
  // Handle string date format
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }
  
  throw new Error('Invalid date format');
};