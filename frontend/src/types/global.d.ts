declare module '@monaco-editor/react' {
  interface EditorProps {
    height?: string | number;
    width?: string | number;
    value?: string;
    defaultValue?: string;
    language?: string;
    theme?: string;
    options?: any;
    onChange?: (value: string | undefined) => void;
    onMount?: (editor: any, monaco: any) => void;
  }

  export function Editor(props: EditorProps): JSX.Element;
}

interface ResearchSource {
  id: string;
  title: string;
  url: string;
  abstract?: string;
  authors?: string[];
  publishedDate?: string;
  citations?: number;
  relevanceScore?: number;
}

interface CanvasAreaRef {
  getCanvas: () => HTMLCanvasElement | null;
  clearCanvas: () => void;
  undo: () => void;
  redo: () => void;
}

interface LayerData {
  id: string;
  visible: boolean;
  opacity: number;
  name: string;
  canvas: HTMLCanvasElement;
  preview?: string;
  blendMode?: string;
}

interface Window {
  gtag: (
    command: 'event',
    action: string,
    params: {
      event_category: string;
      event_label: string;
      [key: string]: any;
    }
  ) => void;
} 