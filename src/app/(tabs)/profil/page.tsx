import type { Metadata } from "next";
import { ProfileSettings } from "@/components/profile-settings";
import { PageHeader } from "@/components/ui/display";

export const metadata: Metadata = { title: "Profil et paramètres" };

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profil et paramètres" />
      <ProfileSettings />
    </>
  );
}
