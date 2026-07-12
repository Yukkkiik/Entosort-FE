// app/dashboard/profile/page.tsx
"use client";
import ProfilePageWrapper from "@/components/profile/ProfilePageWrapper";
import  roleGuard from "@/lib/RoleGuard"
export default function Page() {
    return (
        <ProfilePageWrapper />
    )
}