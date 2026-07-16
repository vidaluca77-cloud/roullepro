import DashboardShell from "@/components/sanitaire/dashboard/DashboardShell";

export default function ProLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
