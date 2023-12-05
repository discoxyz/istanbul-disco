import React from "react";
import "../styles/globals.scss";
import "@rainbow-me/rainbowkit/styles.css";
import { Metadata } from "next";
import { BaseLayout } from "../views/baseLayout";

export const metadata: Metadata = {
  title: "Disco",
  description: "Your social graph",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="relative mx-auto flex min-h-screen max-w-md flex-col bg-slate-200 dark:bg-zinc-900">
        <BaseLayout>{children}</BaseLayout>
      </body>
    </html>
  );
}
