import React from 'react';
import ReactMarkdown from 'react-markdown';

const MarkdownPreview = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-md border border-gray-200">
      <ReactMarkdown>{content || 'Enter Markdown content to preview'}</ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;