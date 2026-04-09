import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

async function triggerGeneration(channelId: string) {
  "use server";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  await fetch(`${baseUrl}/api/channels/${channelId}/generate`, {
    method: "POST",
    cache: "no-store",
  });
}

export default async function ChannelPage({ params }: Props) {
  const { id } = await params;

  const channel = await prisma.channel.findUnique({
    where: { id },
    include: {
      videos: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!channel) {
    return <main style={{ padding: 24 }}>Channel not found</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{channel.name}</h1>
      <p>{channel.niche}</p>

      <form action={triggerGeneration.bind(null, channel.id)}>
        <button type="submit">Generate Video</button>
      </form>

      <div style={{ marginTop: 24 }}>
        {channel.videos.map((video) => (
          <div key={video.id} style={{ marginBottom: 12 }}>
            <div>{video.title ?? "Untitled video"}</div>
            <div>Status: {video.status.toLowerCase()}</div>
            {video.finalVideoUrl ? (
              <a href={video.finalVideoUrl} target="_blank" rel="noreferrer">
                Watch render
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </main>
  );
}
