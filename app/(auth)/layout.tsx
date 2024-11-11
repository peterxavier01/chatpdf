import React from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="flex items-center justify-center min-h-screen">
      {children}
    </main>
  );
}
