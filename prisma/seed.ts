// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Tạo một số người dùng
  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      email: 'user1@example.com',
      password: 'hashed_password_1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      email: 'user2@example.com',
      password: 'hashed_password_2',
    },
  });

  // Tạo nghệ sĩ
  const artist1 = await prisma.artist.create({
    data: {
      name: 'Coldplay',
    },
  });

  // Tạo bài hát
  const song1 = await prisma.song.create({
    data: {
      title: 'Fix You',
      duration: 300,
      url: '/songs/fix-you.mp3',
      artistId: artist1.id,
    },
  });

  const song2 = await prisma.song.create({
    data: {
      title: 'Yellow',
      duration: 270,
      url: '/songs/yellow.mp3',
      artistId: artist1.id,
    },
  });

  // Playlist và thêm bài hát vào playlist
  const playlist1 = await prisma.playlist.create({
    data: {
      name: 'Chill Vibes',
      userId: user1.id,
      songs: {
        create: [
          { songId: song1.id },
          { songId: song2.id },
        ],
      },
    },
  });

  // User2 favorite bài hát
  await prisma.user.update({
    where: { id: user2.id },
    data: {
      favorites: {
        connect: [{ id: song1.id }],
      },
    },
  });

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
