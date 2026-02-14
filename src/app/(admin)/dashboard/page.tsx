import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
    title: "Dashboard",
    description: "Dashboard admin HMPSINF",
};

export default function DashboardPage() {
    return <DashboardClient />;
}
