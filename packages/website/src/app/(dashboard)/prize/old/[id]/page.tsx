import FetchOldprizeDetails from "@/components/prize/oldprizes/fetch-oldprize-details";
import { ScrollArea } from "@viaprize/ui/scroll-area";

export default function OldPage({ params }: { params: { id: number} }) {
  return (
    <div className="flex h-full">
      <ScrollArea className="w-full  h-full   md:border-r-[0.5px]">
        <FetchOldprizeDetails params={params} />
      </ScrollArea>
    </div>
  );
}