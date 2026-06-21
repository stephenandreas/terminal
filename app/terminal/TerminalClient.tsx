"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function TerminalClient({ wsUrl }: { wsUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const term = new Terminal({
      theme: { background: "#09090b" },
      fontFamily: "Menlo, Monaco, 'Courier New', monospace",
      fontSize: 14,
      cursorBlink: true,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(containerRef.current!);
    fit.fit();
    termRef.current = term;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
    };

    ws.onmessage = (e) => {
      const { type, data } = JSON.parse(e.data);
      if (type === "output") term.write(data);
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: "input", data }));
    });

    const onResize = () => {
      fit.fit();
      if (ws.readyState === WebSocket.OPEN)
        ws.send(JSON.stringify({ type: "resize", cols: term.cols, rows: term.rows }));
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      ws.close();
      term.dispose();
    };
  }, [wsUrl]);

  async function handleCopy() {
    const term = termRef.current;
    if (!term) return;
    const selection = term.getSelection();
    if (selection) {
      await navigator.clipboard.writeText(selection);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  async function handlePaste() {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const text = await navigator.clipboard.readText();
    ws.send(JSON.stringify({ type: "input", data: text }));
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">⌘ Terminal</span>
          <span className="text-zinc-500 text-xs">hutasoit.com</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className={`text-xs px-3 py-1.5 rounded-md transition-all duration-150 cursor-pointer select-none ${
              copied
                ? "bg-green-600 text-white scale-95"
                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95"
            }`}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
          <button
            onClick={handlePaste}
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white active:scale-95 active:bg-zinc-600 transition-all duration-150 cursor-pointer select-none"
          >
            Paste
          </button>
          <a href="/api/logout" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors ml-2">
            Sign out
          </a>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 p-2" />
    </main>
  );
}
