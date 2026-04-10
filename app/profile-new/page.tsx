"use client";

import React from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth } from "@/context/AuthContext";
import ProfileHeader from "@/components/profile/ProfileHeader";
import StudentProfileForm from "@/components/profile/StudentProfileForm";
import MentorProfileForm from "@/components/profile/MentorProfileForm";
import { useSearchParams } from "next/navigation";

export default function ProfileNewPage() {
  return (
    <RequireAuth>
      <ProfileNew />
    </RequireAuth>
  );
}

function ProfileNew() {
  const { user } = useAuth();
  const [previewImage, setPreviewImage] = React.useState<string | undefined>(
    user?.studentProfile?.avatarUrl ?? user?.mentorProfile?.avatarUrl ?? undefined
  );

  React.useEffect(() => {
    setPreviewImage(user?.studentProfile?.avatarUrl ?? user?.mentorProfile?.avatarUrl ?? undefined);
  }, [user]);

  const params = useSearchParams();
  const mode = params?.get("mode");
  const isEdit = mode === "edit";

  if (!user) return null;

  return (
    <div style={{ backgroundColor: "#f8f1eb" }} className="min-h-screen py-10">
      <div className="mx-auto max-w-4xl px-4">
        <ProfileHeader
          fullName={user.fullName ?? ""}
          role={user.role}
          profileImage={previewImage}
          onImageChange={(url) => setPreviewImage(url)}
        />

        <div className="mt-6">
          <div className="bg-white shadow rounded-2xl p-6">
            {user.role === "student" ? (
              <StudentProfileForm isEdit={isEdit} initialImage={previewImage} onImageChange={(u) => setPreviewImage(u)} />
            ) : (
              <MentorProfileForm isEdit={isEdit} initialImage={previewImage} onImageChange={(u) => setPreviewImage(u)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
