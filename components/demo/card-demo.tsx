"use client";

import { BlockWrapper } from "@/components/demo/wrapper";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

export function CardDemo() {
	return (
		<BlockWrapper title="Card">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Card title</CardTitle>
					<CardDescription>
						A short description for the card content.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground text-sm">
						Card body text goes here. You can put any content inside.
					</p>
				</CardContent>
				<CardFooter>
					<Button size="sm">Action</Button>
				</CardFooter>
			</Card>
		</BlockWrapper>
	);
}
