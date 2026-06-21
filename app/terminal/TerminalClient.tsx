"use client";

import { useEffect, useRef } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import "@xterm/xterm/css/xterm.css";

export default function TerminalClient({ wsUrl }: { wsUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

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

    const ws = new WebSocket(wsUrl);

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

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">⌘ Terminal</span>
          <span className="text-zinc-500 text-xs">hutasoit.com</span>
        </div>
        <a href="/api/logout" className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
          Sign out
        </a>
      </div>
      <div ref={containerRef} className="flex-1 p-2" />
    </main>
  );
}
