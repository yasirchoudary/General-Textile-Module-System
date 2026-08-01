import type { DashboardWidget } from "@gtms/types";

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mock dashboard data — replace with real API client later. */
export async function fetchDashboardWidgets(): Promise<DashboardWidget[]> {
  await delay();
  return [
    {
      id: "approvals",
      title: "Pending approvals",
      value: "12",
      description: "Purchase and payroll requests awaiting action",
      status: "ready",
    },
    {
      id: "activity",
      title: "Recent activity",
      value: "48",
      description: "Stock and production events in the last 24 hours",
      status: "ready",
    },
    {
      id: "looms",
      title: "Active looms",
      value: "—",
      description: "Weaving KPIs will appear when the module is connected",
      status: "empty",
    },
    {
      id: "cash",
      title: "Cash position",
      value: "—",
      description: "Finance feeds are not connected yet",
      status: "empty",
    },
  ];
}
