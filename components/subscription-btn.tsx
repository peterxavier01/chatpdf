"use client";

import { useState } from "react";
import axios from "axios";

import { Button, ButtonProps } from "./ui/button";
import { LucideArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  isPro: boolean;
  className?: string;
  variant?: ButtonProps["variant"];
};

const SubscriptionBtn = ({ isPro, className, variant = "coral" }: Props) => {
  const [loading, setLoading] = useState(false);

  const handleSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      window.location.href = response.data.url;
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleSubscription}
      className={cn("w-full max-w-80", className)}
      disabled={loading}
    >
      {isPro ? "Manage Subscriptions" : "Get Pro"}
      <LucideArrowUpRight />
    </Button>
  );
};

export default SubscriptionBtn;
