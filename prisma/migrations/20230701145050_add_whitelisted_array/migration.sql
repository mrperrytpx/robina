-- CreateTable
CREATE TABLE "_ChatroomWhitelistedMembers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ChatroomWhitelistedMembers_AB_unique" ON "_ChatroomWhitelistedMembers"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatroomWhitelistedMembers_B_index" ON "_ChatroomWhitelistedMembers"("B");

-- AddForeignKey
ALTER TABLE "_ChatroomWhitelistedMembers" ADD CONSTRAINT "_ChatroomWhitelistedMembers_A_fkey" FOREIGN KEY ("A") REFERENCES "Chatroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatroomWhitelistedMembers" ADD CONSTRAINT "_ChatroomWhitelistedMembers_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
