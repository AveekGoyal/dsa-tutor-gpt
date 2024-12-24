import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Components } from 'react-markdown';
import MermaidRenderer from './mermaid-renderer';
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
      const child = Array.isArray(children) ? children[0] : children;
      if (
        child &&
        typeof child === 'object' &&
        'props' in child &&
        child.props.className?.includes('language-mermaid')
      ) {
        try {
          let diagramContent = '';
          const extractContent = (node: any): void => {
            if (typeof node === 'string') {
              diagramContent += node + '\n';
            } else if (Array.isArray(node)) {
              node.forEach(extractContent);
            } else if (node && typeof node === 'object' && 'props' in node) {
              if (Array.isArray(node.props.children)) {
                node.props.children.forEach(extractContent);
              } else if (node.props.children) {
                extractContent(node.props.children);
              }
            }
          };

          extractContent(child.props.children);
          
          const cleanDiagram = diagramContent
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => 
              line && 
              !line.startsWith('```') && 
              !line.toLowerCase().includes('mermaid')
            )
            .join('\n')
            .trim();
          
          if (cleanDiagram) {
            return (
              <div className="my-4">
                <MermaidRenderer diagram={cleanDiagram} className="w-full" />
              </div>
            );
          }
        } catch (error) {
          console.error('Error processing Mermaid diagram:', error);
        }
        
        return (
          <pre {...props} className={cn("overflow-auto bg-red-50 border-red-200", preClassName)}>
            {children}
          </pre>
        );
      }

      return (
        <pre {...props} className={cn("overflow-auto", preClassName)}>
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
            isInline ? "inline-code" : "block-code",
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
      className={cn("markdown", className)}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={components}
    >
      {processedContent}
    </ReactMarkdown>
  );
}
