import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (
    username === process.env.TERMINAL_USER &&
    password === process.env.TERMINAL_PASS
  ) {
    const cookieStore = await cookies();
    cookieStore.set("terminal_auth", process.env.TERMINAL_SECRET!, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
