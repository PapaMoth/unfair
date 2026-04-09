import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const channel = await prisma.channel.findUnique({
    where: { id },
    include: {
      videos: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!channel || channel.videos.length === 0) {
    return NextResponse.json({ error: "Channel or video not found" }, { status: 404 });
  }

  const video = channel.videos[0];

  // Placeholder render job output.
  const render = {
    videoUrl: `https://example.com/renders/${video.id}.mp4`,
    thumbnailUrl: `https://example.com/renders/${video.id}.jpg`,
    subtitlesUrl: `https://example.com/renders/${video.id}.vtt`,
  };

  await prisma.video.update({
    where: { id: video.id },
    data: {
      finalVideoUrl: render.videoUrl,
      thumbnailUrl: render.thumbnailUrl,
      subtitlesUrl: render.subtitlesUrl,
      status: channel.approvalRequired ? "RENDERED" : "PUBLISHED",
    },
  });

  return NextResponse.json({ ok: true, videoId: video.id, render });
}
