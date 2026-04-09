import { prisma } from "../lib/db";

async function main() {
  await prisma.video.create({
    data: {
      channelId: "YOUR_CHANNEL_ID",
      title: "Demo Completed Video",
      topic: "motivation",
      hook: "Most people quit too early.",
      scriptText: "Demo script",
      status: "RENDERED",
      finalVideoUrl: "https://example.com/demo.mp4",
      thumbnailUrl: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
