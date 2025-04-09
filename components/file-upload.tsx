"use client";

import axios from "axios";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Inbox, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { uploadToS3 } from "@/lib/s3";

const FileUpload = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        // File size is larger than 10MB
        toast.error(
          "File size is too large. Please upload a file smaller than 10MB."
        );
        return;
      }

      try {
        setIsUploading(true);
        const data = await uploadToS3(file);

        if (!data?.file_key || !data.file_name) {
          toast.error("Something went wrong.");
          return;
        }

        mutate(data, {
          onSuccess: ({ chat_id }) => {
            toast.success("Chat created");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            toast.error("Could not extract text from PDF provided");
            console.error(err);
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsUploading(false);
      }
    },
  });

  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps()}
        className="border-dashed border-2 rounded-xl cursor-pointer bg-gray-50 py-8 flex justify-center items-center flex-col"
      >
        <input {...getInputProps()} />
        {isUploading || isPending ? (
          <>
            <Loader2 className="size-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">
              Embedding document...
            </p>
          </>
        ) : (
          <>
            <Inbox className="size-10 text-blue-500" />
            <p>Drag and drop or choose your file.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
