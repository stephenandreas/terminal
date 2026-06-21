import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TerminalPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("terminal_auth");

  if (auth?.value !== process.env.TERMINAL_SECRET) {
    redirect("/");
  }

  redirect("https://izzy-vnic.hutasoit.com");
}
