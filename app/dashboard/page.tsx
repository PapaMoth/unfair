import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const channels = await prisma.channel.findMany({
    include: {
      videos: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p><Link href="/billing">Manage billing</Link></p>

      <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
        {channels.map((channel) => (
          <section
            key={channel.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div style={{ marginBottom: 12 }}>
              <h2 style={{ margin: 0 }}>{channel.name}</h2>
              <p style={{ margin: "8px 0 0 0" }}>
                {channel.niche} · {channel.platform}
              </p>
            </div>

            <div style={{ marginBottom: 12 }}>
              <Link href={`/channels/${channel.id}`}>Open channel</Link>
            </div>

            {channel.videos.length === 0 ? (
              <p>No videos yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {channel.videos.map((video) => {
                  const status = video.status.toLowerCase();

                  return (
                    <article
                      key={video.id}
                      style={{
                        border: "1px solid #eee",
                        borderRadius: 10,
                        padding: 12,
                      }}
                    >
                      <div style={{ marginBottom: 8 }}>
                        <strong>{video.title ?? "Untitled video"}</strong>
                      </div>

                      <div style={{ marginBottom: 8 }}>
                        Status:{" "}
                        <span
                          style={{
                            fontWeight: 600,
                            color:
                              status === "published" || status === "rendered"
                                ? "green"
                                : status === "failed"
                                  ? "red"
                                  : "orange",
                          }}
                        >
                          {status}
                        </span>
                      </div>

                      {video.finalVideoUrl ? (
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          {video.thumbnailUrl ? (
                            <img
                              src={video.thumbnailUrl}
                              alt={video.title ?? "Video thumbnail"}
                              style={{
                                width: 90,
                                height: 160,
                                objectFit: "cover",
                                borderRadius: 8,
                                border: "1px solid #ddd",
                              }}
                            />
                          ) : null}

                          <div style={{ display: "grid", gap: 8 }}>
                            <a href={video.finalVideoUrl} target="_blank" rel="noreferrer">
                              Watch video
                            </a>

                            <Link href={`/videos/${video.id}`}>View details</Link>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0 }}>Render not ready yet.</p>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>
    </main>
  );
}
