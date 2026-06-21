import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TerminalPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("terminal_auth");

  if (auth?.value !== process.env.TERMINAL_SECRET) {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-medium">⌘ Terminal</span>
          <span className="text-zinc-500 text-xs">hutasoit.com</span>
        </div>
        <a
          href="/api/logout"
          className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
        >
          Sign out
        </a>
      </div>
      <iframe
        src="https://terminal.hutasoit.com"
        className="flex-1 w-full border-0"
        allow="clipboard-read; clipboard-write"
      />
    </main>
  );
}
