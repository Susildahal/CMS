"use client";

import { useEffect, useRef, useState } from "react";

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function Editor({
  value,
  onChange,
  placeholder = "Start typing...",
}: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);
  const [mounted, setMounted] = useState(false);
  const isInternalChange = useRef(false);
  const lastExternalValue = useRef(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || quillRef.current) return;

    (async () => {
      try {
        const Quill = (await import("quill")).default;
        await import("quill/dist/quill.snow.css");

        if (!containerRef.current) return;

        const quill = new Quill(containerRef.current, {
          theme: "snow",
          placeholder,
          modules: {
            toolbar: [
              [{ font: [] }, { size: ["small", false, "large", "huge"] }, { header: [1, 2, 3, false] }],
              ["bold", "italic", "underline", "strike", "blockquote", "code-block"],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ indent: "-1" }, { indent: "+1" }],
              [{ color: [] }, { background: [] }],
              [{ align: [] }],
              ["link", "image", "video"],
              ["clean"],
            ],
          },
        });

        quill.root.style.direction = "ltr";
        quill.root.style.textAlign = "left";

        if (value) {
          quill.root.innerHTML = value;
          lastExternalValue.current = value;
        }

        quill.on("text-change", (_delta: any, _old: any, source: string) => {
          if (source !== "user") return;
          isInternalChange.current = true;
          const html = quill.root.innerHTML;
          lastExternalValue.current = html;
          onChange(html);
        });

        quillRef.current = quill;
      } catch (err) {
        console.error("Quill init failed:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  useEffect(() => {
    if (!quillRef.current) return;
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (value !== lastExternalValue.current) {
      const sel = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value || "";
      lastExternalValue.current = value;
      if (sel) quillRef.current.setSelection(sel);
    }
  }, [value]);

  if (!mounted) {
    return (
      <div style={{ height: "280px", border: "1px solid #d0d5dd", borderRadius: "4px", background: "#fff" }} />
    );
  }

  return (
    <>
      <style>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #d0d5dd !important;
          background: #fff;
          padding: 5px 8px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 1px;
          border-radius: 4px 4px 0 0;
        }

        .ql-container.ql-snow {
          border: none !important;
          font-family: 'Arial', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
        }

        .ql-toolbar.ql-snow button {
          width: 26px;
          height: 26px;
          padding: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          transition: background 0.1s;
        }
        .ql-toolbar.ql-snow button:hover {
          background: #e5f2fb !important;
        }
        .ql-toolbar.ql-snow button.ql-active {
          background: #d0e9f7 !important;
        }
        .ql-toolbar.ql-snow button svg {
          width: 14px;
          height: 14px;
        }

        .ql-toolbar.ql-snow .ql-stroke        { stroke: #555; }
        .ql-toolbar.ql-snow .ql-fill          { fill:   #555; }
        .ql-toolbar.ql-snow button:hover  .ql-stroke { stroke: #006caf; }
        .ql-toolbar.ql-snow button:hover  .ql-fill   { fill:   #006caf; }
        .ql-toolbar.ql-snow button.ql-active .ql-stroke { stroke: #006caf; }
        .ql-toolbar.ql-snow button.ql-active .ql-fill   { fill:   #006caf; }

        .ql-toolbar.ql-snow .ql-picker {
          color: #444;
          font-size: 12.5px;
          font-family: Arial, sans-serif;
        }
        .ql-toolbar.ql-snow .ql-picker-label {
          border: 1px solid #ccc !important;
          border-radius: 3px !important;
          background: #fff;
          height: 26px;
          padding: 0 6px !important;
          display: inline-flex;
          align-items: center;
          color: #333 !important;
          transition: border-color 0.12s, background 0.12s;
          font-size: 12.5px;
        }
        .ql-toolbar.ql-snow .ql-picker-label:hover {
          border-color: #006caf !important;
          background: #f0f8ff !important;
          color: #006caf !important;
        }
        .ql-toolbar.ql-snow .ql-picker-label svg {
          width: 12px;
          height: 12px;
          margin-left: 2px;
        }
        .ql-toolbar.ql-snow .ql-picker-label .ql-stroke { stroke: #666; }

        .ql-toolbar.ql-snow .ql-font   { width: 104px; }
        .ql-toolbar.ql-snow .ql-size   { width: 76px; }
        .ql-toolbar.ql-snow .ql-header { width: 84px; }

        .ql-toolbar.ql-snow .ql-picker-options {
          background: #fff;
          border: 1px solid #ccc !important;
          border-radius: 4px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.10);
          padding: 3px;
          z-index: 9999;
          margin-top: 2px;
        }
        .ql-toolbar.ql-snow .ql-picker-item {
          border-radius: 2px;
          padding: 4px 8px;
          font-size: 13px;
          color: #333;
        }
        .ql-toolbar.ql-snow .ql-picker-item:hover {
          background: #e5f2fb;
          color: #006caf;
        }
        .ql-toolbar.ql-snow .ql-picker-item.ql-selected {
          color: #006caf;
          font-weight: 600;
        }

        .ql-toolbar.ql-snow .ql-color-picker .ql-picker-options {
          width: 182px;
          padding: 5px;
        }
        .ql-toolbar.ql-snow .ql-color-picker .ql-picker-item {
          width: 18px;
          height: 18px;
          border-radius: 2px;
          padding: 0;
          border: 2px solid transparent;
        }
        .ql-toolbar.ql-snow .ql-color-picker .ql-picker-item:hover {
          border-color: #006caf;
          background: transparent;
        }

        .ql-toolbar.ql-snow .ql-formats {
          display: inline-flex;
          align-items: center;
          gap: 1px;
          padding-right: 7px;
          margin-right: 4px;
          border-right: 1px solid #e0e4ea;
        }
        .ql-toolbar.ql-snow .ql-formats:last-child {
          border-right: none;
          padding-right: 0;
          margin-right: 0;
        }

        .ql-editor {
          padding: 14px 18px !important;
          min-height: 180px;
          line-height: 1.65;
          color: #1a1a1a;
          caret-color: #006caf;
          font-family: 'Arial', sans-serif;
          font-size: 14px;
        }

        .ql-editor.ql-blank::before {
          color: #bbb !important;
          font-style: normal;
          left: 18px !important;
          font-size: 14px;
        }

        .ql-editor h1 { font-size: 1.55em; font-weight: 700; color: #111; margin: 0.4em 0 0.2em; }
        .ql-editor h2 { font-size: 1.3em;  font-weight: 600; color: #222; margin: 0.35em 0 0.15em; }
        .ql-editor h3 { font-size: 1.1em;  font-weight: 600; color: #333; margin: 0.3em 0 0.1em; }

        .ql-editor blockquote {
          border-left: 3px solid #006caf;
          margin: 8px 0;
          padding: 5px 12px;
          background: #f0f8ff;
          color: #334;
          border-radius: 0 3px 3px 0;
        }

        .ql-editor pre.ql-syntax {
          background: #f5f6f8;
          color: #1a1a1a;
          border: 1px solid #dde1e7;
          border-radius: 3px;
          padding: 10px 14px;
          font-size: 12.5px;
          font-family: 'Consolas', 'Courier New', monospace;
        }

        .ql-editor a { color: #006caf; text-decoration: underline; }
        .ql-editor ol, .ql-editor ul { padding-left: 1.4em; }
        .ql-editor li { margin: 2px 0; }
        .ql-editor ::selection { background: rgba(0,108,175,0.14); }

        .ql-editor::-webkit-scrollbar { width: 5px; }
        .ql-editor::-webkit-scrollbar-track { background: #f9f9f9; }
        .ql-editor::-webkit-scrollbar-thumb { background: #c5dff0; border-radius: 3px; }
        .ql-editor::-webkit-scrollbar-thumb:hover { background: #006caf; }
      `}</style>

      <div
        style={{
          border: "1px solid #d0d5dd",
          borderRadius: "4px",
          background: "#fff",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
        onFocus={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "#006caf";
          el.style.boxShadow = "0 0 0 3px rgba(0,108,175,0.11)";
        }}
        onBlur={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.borderColor = "#d0d5dd";
          el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
        }}
      >
        <div ref={containerRef} dir="ltr" />
      </div>
    </>
  );
}