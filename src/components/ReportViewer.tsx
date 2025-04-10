
import React from 'react';

interface ReportViewerProps {
  html: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ html }) => {
  // Note: In a real application, you would use a library like html-react-parser 
  // or dompurify to safely sanitize the HTML before rendering it.
  // For demo purposes, we'll use dangerouslySetInnerHTML with a warning.
  
  return (
    <div className="overflow-auto max-h-[600px]">
      {/* This is for demo purposes - in production, sanitize the HTML first */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
};

export default ReportViewer;
