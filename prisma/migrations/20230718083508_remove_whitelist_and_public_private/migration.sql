/*
  Warnings:

  - You are about to drop the column `is_public` on the `Chatroom` table. All the data in the column will be lost.
  - You are about to drop the `_ChatroomWhitelistedMembers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ChatroomWhitelistedMembers" DROP CONSTRAINT "_ChatroomWhitelistedMembers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatroomWhitelistedMembers" DROP CONSTRAINT "_ChatroomWhitelistedMembers_B_fkey";

-- AlterTable
ALTER TABLE "Chatroom" DROP COLUMN "is_public";

-- DropTable
DROP TABLE "_ChatroomWhitelistedMembers";
