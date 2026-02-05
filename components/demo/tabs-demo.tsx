"use client";

import { BlockWrapper } from "@/components/demo/wrapper";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TabsDemo() {
  return (
    <BlockWrapper title="Tabs">
      <Tabs className="w-full" defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">Tab one</TabsTrigger>
          <TabsTrigger value="two">Tab two</TabsTrigger>
          <TabsTrigger value="three">Tab three</TabsTrigger>
        </TabsList>
        <TabsContent value="one">
          <p className="text-muted-foreground text-sm">
            Content for the first tab.
          </p>
        </TabsContent>
        <TabsContent value="two">
          <p className="text-muted-foreground text-sm">
            Content for the second tab.
          </p>
        </TabsContent>
        <TabsContent value="three">
          <p className="text-muted-foreground text-sm">
            Content for the third tab.
          </p>
        </TabsContent>
      </Tabs>
    </BlockWrapper>
  );
}
