"use client";

// components/profile/ProfilePageWrapper.tsx
import { useSetHeader } from "@/components/layout/HeaderContext";
import ProfilePage from "./ProfilePage";

export default function ProfilePageWrapper() {

  useSetHeader({
    titleIcon: "👤",
    title: "Profil Saya",
    subtitle: "Kelola informasi akun Anda",
    breadcrumbs: [
      { label: "EntoSort" },
      { label: "Dashboard" },
      { label: "Profil" },
    ],
    pollInterval: 0, // tidak perlu polling di halaman profil
  });

  return <ProfilePage />;
}