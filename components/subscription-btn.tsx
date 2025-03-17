"use client";

import { useState } from "react";
import axios from "axios";

import { Button } from "./ui/button";

type Props = { isPro: boolean };

const SubscriptionBtn = ({ isPro }: Props) => {
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
    <Button onClick={handleSubscription} disabled={loading}>
      {isPro ? "Manage Subscriptions" : "Get Pro"}
    </Button>
  );
};

export default SubscriptionBtn;
