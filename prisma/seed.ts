// import { PrismaClient } from '@prisma/client'
// import { removeVietnameseTones } from '../src/utils/removeTone'

// const prisma = new PrismaClient()

// async function main() {
//   // Xóa sạch dữ liệu cũ (nếu cần)
//   await prisma.playbackHistory.deleteMany()
//   await prisma.playlistSong.deleteMany()
//   await prisma.playlist.deleteMany()
//   await prisma.user.deleteMany()
//   await prisma.song.deleteMany()
//   await prisma.artist.deleteMany()

//   // 1. Tạo nghệ sĩ
//   const artists = await prisma.artist.createMany({
//     data: [
//       { name: 'Đàm Vĩnh Hưng', nameNormalized: removeVietnameseTones('Đàm Vĩnh Hưng') },
//       { name: 'Sơn Tùng M-TP', nameNormalized: removeVietnameseTones('Sơn Tùng M-TP') },
//     ],
//   })

//   // 2. Lấy lại artist để dùng ID
//   const artistList = await prisma.artist.findMany()

//   // 3. Tạo bài hát
//   const songs = await prisma.song.createMany({
//     data: [
//       {
//         title: 'Bình minh sẽ mang em đi',
//         titleNormalized: removeVietnameseTones('Bình minh sẽ mang em đi'),
//         duration: 240,
//         url: '/songs/binh-minh.mp3',
//         artistId: artistList[0].id,
//       },
//       {
//         title: 'Nơi này có anh',
//         titleNormalized: removeVietnameseTones('Nơi này có anh'),
//         duration: 210,
//         url: '/songs/noi-nay-co-anh.mp3',
//         artistId: artistList[1].id,
//       },
//     ],
//   })

//   // 4. Tạo user
//   const user = await prisma.user.create({
//     data: {
//       username: 'demo_user',
//       email: 'demo@example.com',
//       password: 'hashed_password',
//       name: 'Demo User',
//     },
//   })

//   // 5. Tạo playlist
//   const playlist = await prisma.playlist.create({
//     data: {
//       name: 'Yêu thích',
//       userId: user.id,
//     },
//   })

//   // 6. Gán bài hát vào playlist
//   const allSongs = await prisma.song.findMany()
//   await prisma.playlistSong.createMany({
//     data: allSongs.map((song) => ({
//       playlistId: playlist.id,
//       songId: song.id,
//     })),
//   })

//   console.log('✅ Seed dữ liệu thành công!')
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

async function main() {
  // Tìm hoặc tạo artist demo
  let artist = await prisma.artist.findFirst({
    where: { name: 'Nghệ sĩ Demo' },
  });

  if (!artist) {
    artist = await prisma.artist.create({
      data: {
        name: 'Nghệ sĩ Demo',
        nameNormalized: removeVietnameseTones('Nghệ sĩ Demo'),
      },
    });
  }

  interface Song {
  title: string;
  titleNormalized: string;
  duration: number;
  url: string;
  artistId: number;
  createdAt: Date;
}
  // Tạo 100 bài hát
  const songsData: Song[] = [];
  for (let i = 1; i <= 100; i++) {
    songsData.push({
      title: `Bài hát số ${i}`,
      titleNormalized: removeVietnameseTones(`Bài hát số ${i}`),
      duration: 180 + i,
      url: `https://example.com/song${i}.mp3`,
      artistId: artist.id,
      createdAt: new Date(),
    });
  }

  // Tạo bài hát, bỏ qua nếu trùng (prisma yêu cầu trường unique nếu muốn skipDuplicates)
  // Ở đây bạn chưa khai báo unique trên Song, nên skipDuplicates sẽ không hoạt động
  // Bạn có thể thêm unique constraint trên title hoặc titleNormalized nếu cần
  await prisma.song.createMany({
    data: songsData,
    skipDuplicates: true,
  });

  console.log('Seed data created successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

