import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  const body = await req.json();
  console.log("Received WhatsApp message:", body);
  return NextResponse.json({ received: true });
}