import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "./db";
import { userSubscriptions } from "./db/schema";

const DAY_IN_MS = 1000 * 60 * 60 * 24; // a day in milliseconds

export const checkSubscription = async (): Promise<boolean> => {
  const { userId } = await auth();
  if (!userId) return false;

  const _userSubscriptions = await db
    .select()
    .from(userSubscriptions)
    .where(eq(userSubscriptions.userId, userId));

  if (!_userSubscriptions[0]) return false;

  const userSubscription = _userSubscriptions[0];

  if (!userSubscription.stripeCurrentPeriodEnd) return false;

  // Check if the subscription is not expired and still valid
  const isValid =
    userSubscription.stripePriceId &&
    userSubscription.stripeCurrentPeriodEnd?.getTime() + DAY_IN_MS > Date.now();

  return !!isValid;
};
