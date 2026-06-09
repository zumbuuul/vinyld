import { Skeleton } from "@/components/ui/skeleton";

function SectionHeadingSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-3 w-28 rounded-full" />
      <Skeleton className="h-9 w-64" />
    </div>
  );
}

export function NavbarSkeleton() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[rgba(19,19,19,0.7)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Skeleton className="h-8 w-24 rounded-full" />
          <div className="hidden items-center gap-5 md:flex">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-52 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-6 border-t border-white/5 px-6 py-3 md:hidden">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-18" />
      </div>
    </nav>
  );
}

export function RecentFeedSkeleton() {
  return (
    <section className="bg-[#131313] py-16 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6">
        <SectionHeadingSkeleton />
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="rounded-xl bg-[#1c1b1b] p-5 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.55)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20 rounded-full" />
                  </div>
                </div>
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <Skeleton className="h-14 w-14 rounded-sm" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-14 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[88%]" />
                <Skeleton className="h-4 w-[72%]" />
              </div>
            </article>
          ))}
        </div>
        <Skeleton className="h-11 w-28 rounded-xl" />
      </div>
    </section>
  );
}

export function TrendingSectionSkeleton() {
  return (
    <section className="bg-[#1c1b1b] py-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6">
        <SectionHeadingSkeleton />
        <div className="grid gap-8 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, columnIndex) => (
            <div key={columnIndex} className="space-y-4">
              <Skeleton className="h-7 w-36" />
              <div className="flex flex-col gap-4">
                {Array.from({ length: 3 }).map((__, itemIndex) => (
                  <article
                    key={itemIndex}
                    className="rounded-xl bg-[#131313] p-5 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.45)]"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-24 rounded-full" />
                      <Skeleton className="h-3 w-12 rounded-full" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Skeleton className="h-14 w-14 rounded-sm" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-16 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[82%]" />
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
