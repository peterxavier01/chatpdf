"use client";

import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { Message, useChat } from "@ai-sdk/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./message-list";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

type Props = {
  chatId: number;
};

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const { input, handleInputChange, handleSubmit, messages } = useChat({
    api: "/api/chat",
    body: { chatId },
    initialMessages: data || [],
  });

  useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <div
      className="relative max-h-screen overflow-scroll overflow-x-hidden"
      id="message-container"
    >
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-white h-fit border-b border-gray-200">
        <h3 className="text-xl font-bold">Chat</h3>
      </div>

      {/* message list */}
      <MessageList messages={messages} isLoading={isLoading} />

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-2 py-4 bg-white"
      >
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question"
            className="w-full"
          />
          <Button className="bg-blue-600 ml-2">
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
