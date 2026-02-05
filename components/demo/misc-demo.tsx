"use client";

import { BlockWrapper } from "@/components/demo/wrapper";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function MiscDemo() {
	return (
		<BlockWrapper title="Separator, Progress, Skeleton">
			<div className="flex w-full flex-col gap-6">
				<div>
					<p className="text-muted-foreground text-xs">Separator</p>
					<div className="flex items-center gap-2">
						<span className="text-sm">Before</span>
						<Separator className="h-4" orientation="vertical" />
						<span className="text-sm">After</span>
					</div>
					<Separator className="mt-2" />
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Progress</p>
					<Progress value={60} />
				</div>
				<div>
					<p className="text-muted-foreground text-xs">Skeleton</p>
					<div className="flex flex-col gap-2">
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-4/5" />
						<Skeleton className="h-4 w-3/5" />
					</div>
				</div>
			</div>
		</BlockWrapper>
	);
}
