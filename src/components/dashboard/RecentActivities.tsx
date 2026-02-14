"use client";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface ActivityItem {
    id: string;
    title: string;
    slug: string;
    type: string;
    view_count: number;
    status: string;
    created_at: string;
}

interface RecentActivitiesProps {
    data: ActivityItem[];
}

function formatDate(dateStr: string): string {
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

function getTypeBadge(type: string) {
    switch (type) {
        case "berita":
            return { label: "Berita", color: "info" as const };
        case "event":
            return { label: "Event", color: "primary" as const };
        case "pengumuman":
            return { label: "Pengumuman", color: "warning" as const };
        default:
            return { label: type, color: "light" as const };
    }
}

function getStatusBadge(status: string) {
    switch (status) {
        case "Published":
            return { color: "success" as const };
        case "Open":
            return { color: "success" as const };
        case "Draft":
            return { color: "warning" as const };
        case "Closed":
            return { color: "error" as const };
        default:
            return { color: "light" as const };
    }
}

export default function RecentActivities({ data }: RecentActivitiesProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Aktivitas Terbaru
                    </h3>
                    <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
                        Konten terbaru yang ditambahkan
                    </p>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Judul
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tipe
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Views
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Tanggal
                            </TableCell>
                            <TableCell
                                isHeader
                                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                            >
                                Status
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {data.length > 0 ? (
                            data.map((item) => {
                                const typeBadge = getTypeBadge(String(item.type));
                                const statusBadge = getStatusBadge(String(item.status));
                                return (
                                    <TableRow key={`${item.type}-${item.id}`}>
                                        <TableCell className="py-3">
                                            <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90 max-w-[250px] truncate">
                                                {String(item.title)}
                                            </p>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={typeBadge.color}>
                                                {typeBadge.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {Number(item.view_count)}
                                        </TableCell>
                                        <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                            {formatDate(String(item.created_at))}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <Badge size="sm" color={statusBadge.color}>
                                                {String(item.status)}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow>
                                <TableCell className="py-8 text-center text-gray-400" colSpan={5}>
                                    Belum ada aktivitas
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
