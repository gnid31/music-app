-- DropForeignKey
ALTER TABLE `PlaylistSong` DROP FOREIGN KEY `PlaylistSong_playlistId_fkey`;

-- AddForeignKey
ALTER TABLE `PlaylistSong` ADD CONSTRAINT `PlaylistSong_playlistId_fkey` FOREIGN KEY (`playlistId`) REFERENCES `Playlist`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
