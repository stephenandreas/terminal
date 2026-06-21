import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  cookieStore.delete("terminal_auth");
  return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL!));
}
