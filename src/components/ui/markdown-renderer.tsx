import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Components } from 'react-markdown';
import { useMemo } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const mightContainCode = content.includes('```') || content.includes('`') || 
                          content.includes('    ') || content.includes('\t');

  const processedContent = mightContainCode ? content : content.split('\n').join('  \n');

  const components: Components = useMemo(() => ({
    pre: ({ node, className: preClassName, children, ...props }) => {
      return (
        <pre {...props} className={cn("overflow-auto p-4 bg-gray-50 rounded-md", preClassName)}>
          {children}
        </pre>
      );
    },
    code: ({ node, className: codeClassName, children, ...props }) => {
      const isInline = !codeClassName && typeof children === 'string';
      return (
        <code
          {...props}
          className={cn(
            isInline 
              ? "px-1 py-0.5 bg-gray-100 rounded text-sm" 
              : "block text-sm",
            codeClassName
          )}
        >
          {children}
        </code>
      );
    }
  }), []); 

  return (
    <ReactMarkdown
      className={cn("markdown prose dark:prose-invert max-w-none", className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={components}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
