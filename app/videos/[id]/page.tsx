import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VideoDetailsPage({ params }: Props) {
  const { id } = await params;

  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      scenes: {
        orderBy: { sceneIndex: "asc" },
      },
    },
  });

  if (!video) {
    return <main style={{ padding: 24 }}>Video not found</main>;
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>{video.title ?? "Untitled video"}</h1>
      <p>Status: {video.status}</p>
      <p>Topic: {video.topic ?? "N/A"}</p>

      {video.finalVideoUrl ? (
        <div style={{ margin: "16px 0" }}>
          <video
            src={video.finalVideoUrl}
            controls
            style={{ width: 320, maxWidth: "100%", borderRadius: 12 }}
          />
        </div>
      ) : (
        <p>Video file not ready yet.</p>
      )}

      <section style={{ marginTop: 24 }}>
        <h2>Script</h2>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "#f7f7f7",
            padding: 16,
            borderRadius: 12,
          }}
        >
          {video.scriptText ?? "No script available."}
        </pre>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Scenes</h2>
        <div style={{ display: "grid", gap: 12 }}>
          {video.scenes.map((scene) => (
            <div
              key={scene.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div>Scene {scene.sceneIndex}</div>
              <div>Duration: {scene.durationSeconds}s</div>
              <div>Caption: {scene.captionText}</div>
              <div>Voiceover: {scene.voiceoverText}</div>
              {scene.assetUrl ? (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={scene.assetUrl}
                    alt={`Scene ${scene.sceneIndex}`}
                    style={{ width: 120, borderRadius: 8 }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
