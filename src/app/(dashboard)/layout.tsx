import type React from "react";
import { Sidebar } from "@/components/custom/Sidebar";
import { Navbar } from "@/components/custom/Navbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div>
        <div>
          <Navbar />
          <Sidebar />
          <main className="pt-4">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
