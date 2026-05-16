import { Skeleton } from '@/components/ui/skeleton';

export function MenuSkeleton() {
  return (
    <div className="space-y-16">
      {[0, 1].map((s) => (
        <div key={s}>
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-3/4 mt-4" />
                <Skeleton className="h-3 w-1/2 mt-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
