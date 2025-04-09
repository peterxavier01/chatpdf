import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { eq } from "drizzle-orm";

import FileUpload from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import SubscriptionBtn from "@/components/subscription-btn";

import { checkSubscription } from "@/lib/subscription";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  const isPro = await checkSubscription();
  let firstChat;

  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));

    if (firstChat) {
      firstChat = firstChat[0];
    }
  }

  return (
    <div className="min-h-screen h-full bg-gradient-to-b from-off-white to-celestial-blue font-poppins px-4 py-8">
      <div className="pt-4 pr-4 flex items-center justify-end mb-4 md:mb-0">
        <UserButton />
      </div>

      <div className="flex flex-col md:min-h-[calc(100vh-7rem)] justify-center items-center">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-4xl md:text-5xl lg:text-7xl font-extrabold text-rich-black md:mb-4">
              <span className="text-celestial-blue">Chat</span> with your PDFs
            </h1>
          </div>

          <div className="flex mt-4 max-sm:flex-wrap gap-y-4">
            {isAuth && firstChat && (
              <Button variant="coral" asChild className="w-full max-w-80">
                <Link href={`/chat/${firstChat.id}`}>Go to Chats</Link>
              </Button>
            )}
            <div className="md:ml-3 w-full">
              <SubscriptionBtn isPro={isPro} />
            </div>
          </div>

          <p className="max-w-xl mt-4 text-lg text-slate-700">
            Join millions using AI to get instant answers and insights from
            research.
          </p>

          <div className="w-full mt-4">
            {isAuth ? (
              <FileUpload />
            ) : (
              <Link href="/sign-in" passHref legacyBehavior>
                <Button>
                  Login to get started
                  <LogIn className="size-4 ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
