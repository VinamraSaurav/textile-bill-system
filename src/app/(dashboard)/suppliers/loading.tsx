import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Skeleton className="h-10 w-[300px]" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="p-1">
              <div className="flex h-10 items-center border-b px-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="ml-auto h-4 w-24" />
                <Skeleton className="ml-4 h-4 w-24" />
                <Skeleton className="ml-4 h-4 w-24" />
              </div>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex h-16 items-center border-b px-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="ml-auto h-4 w-24" />
                  <Skeleton className="ml-4 h-4 w-24" />
                  <Skeleton className="ml-4 h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
