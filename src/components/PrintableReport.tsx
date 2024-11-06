import React from 'react';

interface PrintableReportProps {
  content: string;
}

export function PrintableReport({ content }: PrintableReportProps) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: content
      }}
      style={{ display: 'none' }}
    />
  );
}