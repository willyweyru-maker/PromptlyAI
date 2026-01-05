import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { description, platform } = await req.json();

  // Fake posts for now
  const posts = [
    `Sample post for ${platform}:\n\n"${description}"\n\nThis is a great idea! ✨ #Business #${platform}`,
    `Another idea:\n\nExciting update: ${description} 😍 Come check it out!`,
    `Third variation:\n\nJust launched: ${description} 🚀 Perfect for you!`
  ];

  return NextResponse.json({ posts });
}