import { AppShell } from "@/components/app-shell";

export default function TabsLayout({ children }: LayoutProps<"/">) {
  return <AppShell>{children}</AppShell>;
}
