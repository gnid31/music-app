import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const songs = Array.from({ length: 100 }, (_, i) => ({
    title: `Bài hát ${i + 201}`,
    titleNormalized: `bai hat ${i + 201}`,
    genre: 'K-POP',
    duration: 289,
    url: 'https://gnid31-bucket.s3.ap-southeast-1.amazonaws.com/mp3/59_kyoto jam.mp3',
    imageUrl: null,
    artistId: 13, // Bạn có thể thay bằng ID phù hợp
  }))

  for (const song of songs) {
    await prisma.song.create({ data: song })
  }
}

main()
  .then(() => {
    console.log('✅ Seeded 100 songs successfully.')
    return prisma.$disconnect()
  })
  .catch((e) => {
    console.error('❌ Error seeding songs:', e)
    return prisma.$disconnect()
  })
