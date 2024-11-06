export const printReport = (content: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print reports');
    return;
  }

  printWindow.document.open();
  printWindow.document.write(content);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };
};