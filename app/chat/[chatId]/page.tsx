import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import ChatSidebar from "@/components/chat-sidebar";
import PDFViewer from "@/components/pdf-viewer";
import ChatComponent from "@/components/chat-component";

import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { checkSubscription } from "@/lib/subscription";

type Props = {
  params: Promise<{ chatId: string }>;
};

export default async function ChatPage({ params }: Props) {
  const chatId = (await params).chatId;
  const isPro = await checkSubscription();
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    return redirect("/");
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <div className="flex max-h-screen overflow-scroll overflow-x-hidden">
      <div className="flex w-full max-h-screen overflow-scroll overflow-x-hidden">
        {/** chat sidebar */}
        <div className="flex-1 max-w-xs">
          <ChatSidebar chats={_chats} chatId={parseInt(chatId)} isPro={isPro} />
        </div>

        {/** pdf viewer */}
        <div className="max-h-screen p-4 overflow-scroll overflow-x-hidden flex-[5]">
          <PDFViewer pdf_url={currentChat?.pdfUrl || ""} />
        </div>

        {/** chat component */}
        <div className="flex-[3] border-l-4 border-l-slate-200">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
}
