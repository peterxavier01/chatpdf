import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight, LogIn } from "lucide-react";
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
    <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton />
          </div>

          <div className="flex mt-4">
            {isAuth && firstChat && (
              <Button asChild>
                <Link href={`/chat/${firstChat.id}`}>
                  Go to Chats
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            )}
            <div className="ml-3">
              <SubscriptionBtn isPro={isPro} />
            </div>
          </div>

          <p className="max-w-xl mt-4 text-lg text-slate-600">
            Join millions of students, researchers and professionals answer
            questions and understand research with AI
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
