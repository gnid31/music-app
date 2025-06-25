import { PrismaClient } from "@prisma/client";
import { removeVietnameseTones } from "../src/utils/removeTone";

const prisma = new PrismaClient();

async function main() {

  const songs = await prisma.song.createMany({
    data: [
      {
    title: 'Về Bên Anh',
    titleNormalized: removeVietnameseTones('Về Bên Anh'),
    duration: 240,
    url: 'https://example.com/songs/vebenanh.mp3',
    imageUrl: 'https://example.com/images/songs/vebenanh.jpg',
    artistId: 10,
  },
  {
    title: 'Hồng Nhan',
    titleNormalized: removeVietnameseTones('Hồng Nhan'),
    duration: 240,
    url: 'https://example.com/songs/hongnhan.mp3',
    imageUrl: 'https://example.com/images/songs/hongnhan.jpg',
    artistId: 10,
  },
  {
    title: 'Bạc Phận',
    titleNormalized: removeVietnameseTones('Bạc Phận'),
    duration: 240,
    url: 'https://example.com/songs/bacphan.mp3',
    imageUrl: 'https://example.com/images/songs/bacphan.jpg',
    artistId: 10,
  },
  {
    title: 'Sao Em Vô Tình',
    titleNormalized: removeVietnameseTones('Sao Em Vô Tình'),
    duration: 240,
    url: 'https://example.com/songs/saoemvotinh.mp3',
    imageUrl: 'https://example.com/images/songs/saoemvotinh.jpg',
    artistId: 10,
  },
  {
    title: 'Sóng Gió',
    titleNormalized: removeVietnameseTones('Sóng Gió'),
    duration: 240,
    url: 'https://example.com/songs/songgio.mp3',
    imageUrl: 'https://example.com/images/songs/songgio.jpg',
    artistId: 10,
  },
  {
    title: 'Em Gì Ơi',
    titleNormalized: removeVietnameseTones('Em Gì Ơi'),
    duration: 240,
    url: 'https://example.com/songs/emgioi.mp3',
    imageUrl: 'https://example.com/images/songs/emgioi.jpg',
    artistId: 10,
  },
  {
    title: 'Hoa Vô Sắc',
    titleNormalized: removeVietnameseTones('Hoa Vô Sắc'),
    duration: 240,
    url: 'https://example.com/songs/hoavosac.mp3',
    imageUrl: 'https://example.com/images/songs/hoavosac.jpg',
    artistId: 10,
  },
  {
    title: 'Là Một Thằng Con Trai',
    titleNormalized: removeVietnameseTones('Là Một Thằng Con Trai'),
    duration: 240,
    url: 'https://example.com/songs/lamotthangcontrai.mp3',
    imageUrl: 'https://example.com/images/songs/lamotthangcontrai.jpg',
    artistId: 10,
  },
  {
    title: 'Hoa Hải Đường',
    titleNormalized: removeVietnameseTones('Hoa Hải Đường'),
    duration: 240,
    url: 'https://example.com/songs/hoahaiduong.mp3',
    imageUrl: 'https://example.com/images/songs/hoahaiduong.jpg',
    artistId: 10,
  },
  {
    title: 'Đom Đóm',
    titleNormalized: removeVietnameseTones('Đom Đóm'),
    duration: 240,
    url: 'https://example.com/songs/domdom.mp3',
    imageUrl: 'https://example.com/images/songs/domdom.jpg',
    artistId: 10,
  },
  {
    title: 'Ngôi Sao Cô Đơn',
    titleNormalized: removeVietnameseTones('Ngôi Sao Cô Đơn'),
    duration: 240,
    url: 'https://example.com/songs/ngoisaocodon.mp3',
    imageUrl: 'https://example.com/images/songs/ngoisaocodon.jpg',
    artistId: 10,
  },
  {
    title: 'Cuối Cùng Thì',
    titleNormalized: removeVietnameseTones('Cuối Cùng Thì'),
    duration: 240,
    url: 'https://example.com/songs/cuoicungthi.mp3',
    imageUrl: 'https://example.com/images/songs/cuoicungthi.jpg',
    artistId: 10,
  },
  {
    title: 'Xoá Tên Anh Đi',
    titleNormalized: removeVietnameseTones('Xoá Tên Anh Đi'),
    duration: 240,
    url: 'https://example.com/songs/xoatenanhdi.mp3',
    imageUrl: 'https://example.com/images/songs/xoatenanhdi.jpg',
    artistId: 10,
  },
  {
    title: 'Chúng Ta Rồi Sẽ Hạnh Phúc',
    titleNormalized: removeVietnameseTones('Chúng Ta Rồi Sẽ Hạnh Phúc'),
    duration: 240,
    url: 'https://example.com/songs/chungtaruoisehanhphuc.mp3',
    imageUrl: 'https://example.com/images/songs/chungtaruoisehanhphuc.jpg',
    artistId: 10,
  },
  {
    title: 'Thiên Lý Ơi',
    titleNormalized: removeVietnameseTones('Thiên Lý Ơi'),
    duration: 240,
    url: 'https://example.com/songs/thienlyoi.mp3',
    imageUrl: 'https://example.com/images/songs/thienlyoi.jpg',
    artistId: 10,
  },
  {
    title: 'Dưới Tán Cây Khô Hoa Nở',
    titleNormalized: removeVietnameseTones('Dưới Tán Cây Khô Hoa Nở'),
    duration: 240,
    url: 'https://example.com/songs/duoitankaykhohoano.mp3',
    imageUrl: 'https://example.com/images/songs/duoitankaykhohoano.jpg',
    artistId: 10,
  },
  {
    title: 'Trạm Dừng Chân',
    titleNormalized: removeVietnameseTones('Trạm Dừng Chân'),
    duration: 240,
    url: 'https://example.com/songs/tramdungchan.mp3',
    imageUrl: 'https://example.com/images/songs/tramdungchan.jpg',
    artistId: 10,
  },
  ],
  });

  console.log("✅ Seeded artists and songs directly.");
}

main()
  .catch((err) => {
    console.error("❌ Error seeding:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
