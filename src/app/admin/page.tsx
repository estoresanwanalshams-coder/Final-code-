import { AdminAuthGate } from "@/components/AdminAuthGate";
import { AdminTabsPanel } from "@/components/AdminTabsPanel";

export default function AdminPage() {
  return (
    <AdminAuthGate>
      <AdminTabsPanel />
    </AdminAuthGate>
  );
}
