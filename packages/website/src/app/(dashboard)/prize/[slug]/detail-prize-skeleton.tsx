import { Card, CardContent, CardHeader, CardTitle } from '@viaprize/ui/card'
import { ScrollArea } from '@viaprize/ui/scroll-area'
import { Separator } from '@viaprize/ui/separator'
import { Skeleton } from '@viaprize/ui/skeleton'

export default function PrizeDetailsSkeleton() {
  return (
    <div className="lg:flex h-full">
      <ScrollArea className="w-full space-y-3 py-4 md:w-[75%] h-full border-r-2">
        <div className="space-y-4 p-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <Separator />
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-3/4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="flex space-x-2">
            {[...Array(4)].map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              <Skeleton key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>
      </ScrollArea>
      <div className="w-full lg:w-[25%] mt-5 mx-3 space-y-5 lg:overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/2" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-2/3" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-1/2" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
