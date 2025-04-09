"use client";

import Link from "next/link";
import { MessageSquare, PlusCircle, Sidebar, SidebarClose } from "lucide-react";

import { Button } from "./ui/button";
import SubscriptionBtn from "./subscription-btn";

import { DrizzleChat } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import useSidebarStore from "@/hooks/useSidebarStore";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
  isPro: boolean;
};

const ChatSidebar = ({ chats, chatId, isPro }: Props) => {
  const { isOpen, onOpen, onClose } = useSidebarStore();
  return (
    <div
      className={cn(
        "w-full h-screen relative overflow-y-auto p-4 text-gray-200 bg-rich-black font-poppins transition-all duration-300 ease-in-out",
        {
          "max-w-72": isOpen,
          "max-w-20": !isOpen,
        }
      )}
    >
      <div
        className={cn("w-full min-h-10", {
          "flex justify-center transition-all duration-300": !isOpen,
        })}
      >
        {isOpen ? (
          <SidebarClose onClick={onClose} className="cursor-pointer" />
        ) : (
          <Sidebar onClick={onOpen} className="cursor-pointer" />
        )}
      </div>

      <Link href="/">
        <Button className="w-full border border-white border-dashed">
          <PlusCircle className={cn("size-4", isOpen ? "mr-2" : "")} />
          {isOpen ? "New Chat" : ""}
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("rounded-lg p-3 text-slate-300 flex items-center", {
                "bg-celestial-blue text-white": chat.id === chatId,
                "hover:text-white": chat.id === chatId,
              })}
            >
              <MessageSquare className="mr-2 flex-shrink-0" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div
        className={cn(
          "absolute bottom-0 inset-x-0 px-4 mb-4",
          !isOpen ? "invisible" : ""
        )}
      >
        <div className="text-sm text-slate-500 mb-4">
          <Link href="/">Home</Link>
        </div>
        <SubscriptionBtn
          variant="accent"
          className="!max-w-full"
          isPro={isPro}
        />
      </div>
    </div>
  );
};

export default ChatSidebar;
