-- CreateTable
CREATE TABLE "_ChatroomInvitedMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatroomInvitedMembers_AB_unique" ON "_ChatroomInvitedMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatroomInvitedMembers_B_index" ON "_ChatroomInvitedMembers"("B");

-- AddForeignKey
ALTER TABLE "_ChatroomInvitedMembers" ADD CONSTRAINT "_ChatroomInvitedMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatroomInvitedMembers" ADD CONSTRAINT "_ChatroomInvitedMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
