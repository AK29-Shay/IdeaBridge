"use client"

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { SkillMultiSelect } from "@/components/forms/SkillMultiSelect";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [bio, setBio] = React.useState(user?.mentorProfile?.bio ?? "");
  const [skills, setSkills] = React.useState<string[]>(user?.mentorProfile?.skills ?? []);

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your mentor profile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{user?.fullName?.charAt(0) ?? "M"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{user?.fullName}</div>
              <div className="text-xs text-muted-foreground">Mentor</div>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-sm">Bio</label>
              <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div>
              <label className="text-sm">Skills</label>
              <SkillMultiSelect value={skills} onChange={(next) => setSkills(next)} options={["React", "Next.js", "TypeScript", "Node.js", "System Design"]} />
            </div>

            <div className="flex gap-2">
              <Button className="bg-primary text-[#0F0F0F]">Save</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
