"use client";

import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import LoginPage from "@/components/LoginPage";

export default function HomePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Calendar />
      </main>
    </div>
  );
}
