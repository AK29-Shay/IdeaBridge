"use client";

import React from "react";

export default function ProfileHeader({
  fullName,
  role,
  profileImage,
  onImageChange,
}: {
  fullName: string;
  role: "student" | "mentor";
  profileImage?: string | null;
  onImageChange?: (url?: string) => void;
}) {
  const initials = fullName?.split(" ")?.map((s) => s[0])?.slice(0, 2).join("")?.toUpperCase() ?? "U";

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white shadow p-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-[#f4c79f] flex items-center justify-center text-white text-2xl font-bold">
          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImage} alt={fullName} className="h-full w-full object-cover" onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <div>
          <div className="text-lg font-semibold text-slate-800">{fullName || "Unnamed"}</div>
          <div className="mt-1 inline-flex items-center gap-2">
            <span className="text-sm rounded-full px-3 py-1 text-[#0F0F0F] bg-[#f4c79f] font-medium">{role === "student" ? "Student" : "Mentor"}</span>
          </div>
        </div>
      </div>

      <div className="ml-auto w-64">
        <label className="block text-sm font-medium text-slate-700">Profile image URL</label>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            placeholder="https://..."
            defaultValue={profileImage ?? ""}
            onChange={(e) => onImageChange?.(e.target.value || undefined)}
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
