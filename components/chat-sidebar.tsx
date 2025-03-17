"use client";

import Link from "next/link";
import { MessageCircle, PlusCircle } from "lucide-react";

import { Button } from "./ui/button";
import SubscriptionBtn from "./subscription-btn";

import { DrizzleChat } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSidebar = ({ chats, chatId, isPro }: Props) => {
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gray-900">
      <Link href="/">
        <Button className="w-full border border-white border-dashed">
          <PlusCircle className="mr-2 size-4" />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-blue-500 text-white": chat.id === chatId,
                "hover:text-white": chat.id === chatId,
              })}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="absolute bottom-0 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
        </div>

        <SubscriptionBtn isPro={isPro} />
      </div>
    </div>
  );
};

export default ChatSidebar;
