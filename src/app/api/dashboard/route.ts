import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const trendGroupParam = request.nextUrl.searchParams.get("trendGroup");
    const trendGroup =
      trendGroupParam === "day" || trendGroupParam === "week" || trendGroupParam === "month"
        ? trendGroupParam
        : "month";

    const trendPeriodExpr =
      trendGroup === "day"
        ? "strftime('%Y-%m-%d', created_at)"
        : trendGroup === "week"
          ? "strftime('%Y-W%W', created_at)"
          : "strftime('%Y-%m', created_at)";

    // 1. Aggregate metrics
    const metricsResult = await db.execute({
      sql: `SELECT 
        (SELECT COUNT(*) FROM news) as total_news,
        (SELECT COUNT(*) FROM news WHERE is_published = 1) as published_news,
        (SELECT COUNT(*) FROM news WHERE is_published = 0) as draft_news,
        (SELECT COALESCE(SUM(view_count), 0) FROM news) as total_news_views,
        (SELECT COUNT(*) FROM events) as total_events,
        (SELECT COALESCE(SUM(view_count), 0) FROM events) as total_event_views,
        (SELECT COUNT(*) FROM pengumuman) as total_pengumuman,
        (SELECT COUNT(*) FROM pengumuman WHERE is_published = 1) as published_pengumuman,
        (SELECT COALESCE(SUM(view_count), 0) FROM pengumuman) as total_pengumuman_views,
        (SELECT COUNT(*) FROM documents) as total_documents,
        (SELECT COALESCE(SUM(download_count), 0) FROM documents) as total_downloads,
        (SELECT COUNT(*) FROM galleries) as total_galleries,
        (SELECT COUNT(*) FROM gallery_images) as total_gallery_images,
        (SELECT COUNT(*) FROM program_kerja) as total_proker,
        (SELECT COUNT(*) FROM divisions) as total_divisions,
        (SELECT COUNT(*) FROM division_members) as total_members,
        (SELECT COUNT(*) FROM news_comments) as total_comments,
        (SELECT COUNT(*) FROM news_comments WHERE is_approved = 0) as pending_comments
      `,
      args: [],
    });
    const metrics = metricsResult.rows[0];

    // 2. Top content by views
    const topNewsResult = await db.execute({
      sql: `SELECT title, slug, view_count, published_at, created_at 
            FROM news WHERE is_published = 1 
            ORDER BY view_count DESC LIMIT 5`,
      args: [],
    });

    const topEventsResult = await db.execute({
      sql: `SELECT title, slug, view_count, event_date, is_open, created_at 
            FROM events ORDER BY view_count DESC LIMIT 5`,
      args: [],
    });

    // 3. Program kerja status distribution
    const prokerStatusResult = await db.execute({
      sql: `SELECT status, COUNT(*) as count FROM program_kerja GROUP BY status`,
      args: [],
    });

    // 4. Division member stats
    const divisionStatsResult = await db.execute({
      sql: `SELECT d.name as division_name, d.color, COUNT(dm.id) as member_count 
            FROM divisions d 
            LEFT JOIN division_members dm ON d.id = dm.division_id 
            GROUP BY d.id, d.name, d.color 
            ORDER BY member_count DESC`,
      args: [],
    });

    // 5. Content creation trend (day/week/month)
    const contentTrendResult = await db.execute({
      sql: `
        SELECT period,
               SUM(news_count) as news_count, 
               SUM(event_count) as event_count, 
               SUM(pengumuman_count) as pengumuman_count
        FROM (
          SELECT ${trendPeriodExpr} as period, 1 as news_count, 0 as event_count, 0 as pengumuman_count FROM news
          UNION ALL
          SELECT ${trendPeriodExpr} as period, 0, 1, 0 FROM events
          UNION ALL
          SELECT ${trendPeriodExpr} as period, 0, 0, 1 FROM pengumuman
        ) combined
        WHERE period IS NOT NULL
        GROUP BY period
        ORDER BY period ASC
      `,
      args: [],
    });

    // 6. Recent activities (combined from news, events, pengumuman)
    const recentActivitiesResult = await db.execute({
      sql: `
        SELECT * FROM (
          SELECT id, title, slug, 'berita' as type, view_count, 
                 CASE WHEN is_published = 1 THEN 'Published' ELSE 'Draft' END as status,
                 created_at
          FROM news
          UNION ALL
          SELECT id, title, slug, 'event' as type, view_count,
                 CASE WHEN is_open = 1 THEN 'Open' ELSE 'Closed' END as status,
                 created_at
          FROM events
          UNION ALL
          SELECT id, title, slug, 'pengumuman' as type, view_count,
                 CASE WHEN is_published = 1 THEN 'Published' ELSE 'Draft' END as status,
                 created_at
          FROM pengumuman
        ) combined
        ORDER BY created_at DESC
        LIMIT 10
      `,
      args: [],
    });

    // 7. Content views comparison (for bar chart)
    const contentViewsResult = await db.execute({
      sql: `
        SELECT title, view_count, 'berita' as type FROM news WHERE is_published = 1
        UNION ALL
        SELECT title, view_count, 'event' as type FROM events
        UNION ALL
        SELECT title, view_count, 'pengumuman' as type FROM pengumuman WHERE is_published = 1
        ORDER BY view_count DESC
        LIMIT 10
      `,
      args: [],
    });

    return NextResponse.json({
      metrics,
      topNews: topNewsResult.rows,
      topEvents: topEventsResult.rows,
      prokerStatus: prokerStatusResult.rows,
      divisionStats: divisionStatsResult.rows,
      contentTrend: contentTrendResult.rows,
      recentActivities: recentActivitiesResult.rows,
      contentViews: contentViewsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
