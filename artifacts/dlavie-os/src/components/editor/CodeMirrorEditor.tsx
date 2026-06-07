import { useEffect, useRef, useCallback } from "react";
import { EditorView, keymap, lineNumbers, drawSelection, highlightActiveLine, dropCursor } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { indentOnInput, syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentUnit } from "@codemirror/language";
import { autocompletion, closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";

function getLanguageExtension(filename: string): Extension {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "js": case "jsx": case "mjs": return javascript({ jsx: true });
    case "ts": case "tsx": return javascript({ typescript: true, jsx: true });
    case "py": return python();
    case "rs": return rust();
    case "css": case "scss": return css();
    case "html": case "htm": return html();
    case "json": return json();
    default: return [];
  }
}

const dlavieTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "#e2e8f0",
    height: "100%",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
    fontSize: "13px",
  },
  ".cm-content": { caretColor: "#a78bfa" },
  ".cm-cursor": { borderLeftColor: "#a78bfa", borderLeftWidth: "2px" },
  ".cm-selectionBackground": { backgroundColor: "#4f46e5 !important", opacity: "0.4" },
  "&.cm-focused .cm-selectionBackground": { backgroundColor: "#6366f1 !important", opacity: "0.4" },
  ".cm-gutters": {
    backgroundColor: "rgba(10, 8, 30, 0.6)",
    color: "#4b5563",
    border: "none",
    borderRight: "1px solid rgba(139, 92, 246, 0.15)",
  },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 12px 0 8px", minWidth: "36px" },
  ".cm-activeLine": { backgroundColor: "rgba(139, 92, 246, 0.06)" },
  ".cm-activeLineGutter": { backgroundColor: "rgba(139, 92, 246, 0.10)", color: "#a78bfa" },
  ".cm-matchingBracket": { backgroundColor: "rgba(167, 139, 250, 0.25)", outline: "none" },
  ".cm-foldGutter": { width: "12px" },
  ".cm-tooltip": {
    backgroundColor: "rgba(15, 10, 40, 0.95)",
    border: "1px solid rgba(139, 92, 246, 0.3)",
    borderRadius: "8px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "rgba(99, 102, 241, 0.4)",
    color: "#e2e8f0",
  },
  ".cm-scroller": { overflow: "auto" },
}, { dark: true });

interface CodeMirrorEditorProps {
  value: string;
  filename: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function CodeMirrorEditor({ value, filename, onChange, readOnly = false }: CodeMirrorEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const createExtensions = useCallback((fname: string): Extension[] => [
    lineNumbers(),
    highlightActiveLine(),
    drawSelection(),
    dropCursor(),
    bracketMatching(),
    closeBrackets(),
    foldGutter(),
    history(),
    indentOnInput(),
    indentUnit.of("  "),
    autocompletion(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    getLanguageExtension(fname),
    oneDark,
    dlavieTheme,
    keymap.of([
      ...closeBracketsKeymap,
      ...defaultKeymap,
      ...historyKeymap,
      indentWithTab,
    ]),
    EditorView.lineWrapping,
    EditorView.editable.of(!readOnly),
    EditorView.updateListener.of((update) => {
      if (update.docChanged && onChangeRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    }),
  ], [readOnly]);

  useEffect(() => {
    if (!containerRef.current) return;
    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: createExtensions(filename),
      }),
      parent: containerRef.current,
    });
    viewRef.current = view;
    return () => { view.destroy(); viewRef.current = null; };
  }, [filename]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: value },
      });
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden"
      style={{ background: "rgba(8, 5, 25, 0.7)" }}
    />
  );
}
