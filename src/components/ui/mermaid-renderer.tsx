import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { AlertCircle } from 'lucide-react';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  themeVariables: {
    fontFamily: 'arial',
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis',
  },
});

interface MermaidRendererProps {
  diagram: string;
  className?: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ diagram, className }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const renderingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (renderingRef.current || !mountedRef.current) return;
    renderingRef.current = true;

    const timeoutId = setTimeout(async () => {
      try {
        setError('');
        setSvg('');

        const trimmedDiagram = diagram.trim();
        if (!trimmedDiagram) {
          throw new Error('Empty diagram');
        }

        const firstLine = trimmedDiagram.split('\n')[0].trim().toLowerCase();
        const validTypes = ['graph', 'flowchart', 'sequencediagram', 'classDiagram', 'stateDiagram', 'gantt', 'pie'];
        const foundType = validTypes.find(type => firstLine.includes(type));
        
        if (!foundType) {
          throw new Error('Invalid diagram type');
        }

        const processedDiagram = firstLine.startsWith(foundType) 
          ? trimmedDiagram 
          : `${foundType} ${trimmedDiagram}`;

        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        await mermaid.parse(processedDiagram);
        const { svg } = await mermaid.render(id, processedDiagram);
        
        if (mountedRef.current) {
          setSvg(svg);
        }
      } catch (err) {
        if (mountedRef.current) {
          console.error('Error rendering Mermaid diagram:', err);
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      } finally {
        renderingRef.current = false;
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      renderingRef.current = false;
    };
  }, [diagram]);

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 text-sm bg-red-50 border border-red-200 rounded-md">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <div className="flex flex-col">
          <span className="font-medium text-red-800">Diagram Error</span>
          <span className="text-red-600 whitespace-pre-wrap">{error}</span>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default MermaidRenderer;
