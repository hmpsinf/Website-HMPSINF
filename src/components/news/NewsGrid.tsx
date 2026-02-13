import NewsCard from './NewsCard';

interface NewsGridProps {
    news: any[]; // Using any[] for simplicity, relies on the data structure passed from page
}

export default function NewsGrid({ news }: NewsGridProps) {
    if (news.length === 0) {
        return (
            <div className="py-20 text-center border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
                <p className="text-gray-500 dark:text-gray-400">Belum ada berita dalam kategori ini.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {news.map((item, index) => (
                <div
                    key={item.id}
                    className="fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    <NewsCard news={item} />
                </div>
            ))}
        </div>
    );
}
