import { SearchExplorer } from "@/components/search/SearchExplorer";

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#131313] px-4 py-24 text-white sm:px-6 sm:py-28">
      <div className="mx-auto max-w-6xl">
        <SearchExplorer />
      </div>
    </main>
  );
}
