import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Components } from 'react-markdown';
import { useMemo, useState, useRef } from 'react';
import { Copy, Check } from 'lucide-react';

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
      const [copied, setCopied] = useState(false);
      const preRef = useRef<HTMLPreElement>(null);

      const copyToClipboard = async () => {
        if (preRef.current) {
          const codeElement = preRef.current.querySelector('code');
          const textContent = codeElement?.textContent || '';
          await navigator.clipboard.writeText(textContent);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      };

      return (
        <div className="relative group">
          <pre ref={preRef} {...props} className={cn("overflow-auto p-4 bg-gray-50 rounded-md", preClassName)}>
            {children}
          </pre>
          <button
            onClick={copyToClipboard}
            className="absolute top-2 right-2 p-2 bg-gray-700 hover:bg-gray-600 text-white rounded opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
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
