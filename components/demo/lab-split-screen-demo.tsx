"use client";

import { PlayIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LabSplitScreenDemo() {
  return (
    <div className="flex h-[600px] flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-xl">
            Lab Exercise: Network Configuration
          </h2>
          <p className="text-muted-foreground text-sm">
            Configure a secure network topology with firewall rules
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <RefreshCwIcon className="size-4" />
            Reset
          </Button>
          <Button size="sm">
            <PlayIcon className="size-4" />
            Run
          </Button>
        </div>
      </div>
      <ResizablePanelGroup
        className="flex-1 rounded-lg border"
        orientation="horizontal"
      >
        <ResizablePanel defaultSize={40} minSize={30}>
          <Card className="h-full rounded-none border-0">
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
              <CardDescription>
                Follow these steps to complete the lab
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 overflow-auto">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">
                  Step 1: Configure Router
                </h4>
                <p className="text-muted-foreground text-xs">
                  Set up the router with IP address 192.168.1.1 and enable DHCP.
                  Use the following command:
                </p>
                <div className="rounded-md bg-muted p-2 font-mono text-xs">
                  router configure --ip 192.168.1.1 --dhcp enable
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">
                  Step 2: Configure Firewall
                </h4>
                <p className="text-muted-foreground text-xs">
                  Create firewall rules to allow HTTP and HTTPS traffic while
                  blocking all other ports.
                </p>
                <div className="rounded-md bg-muted p-2 font-mono text-xs">
                  firewall add-rule --port 80 --allow
                  <br />
                  firewall add-rule --port 443 --allow
                  <br />
                  firewall default-deny
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">
                  Step 3: Test Connectivity
                </h4>
                <p className="text-muted-foreground text-xs">
                  Verify that devices can communicate through the configured
                  network. Test with ping and HTTP requests.
                </p>
              </div>
            </CardContent>
          </Card>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} minSize={40}>
          <Card className="h-full rounded-none border-0">
            <CardHeader>
              <CardTitle>Lab Environment</CardTitle>
              <CardDescription>
                Interactive terminal and network simulator
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)]">
              <Tabs className="h-full" defaultValue="terminal">
                <TabsList>
                  <TabsTrigger value="terminal">Terminal</TabsTrigger>
                  <TabsTrigger value="network">Network View</TabsTrigger>
                  <TabsTrigger value="output">Output</TabsTrigger>
                </TabsList>
                <TabsContent
                  className="mt-4 h-[calc(100%-60px)]"
                  value="terminal"
                >
                  <div className="h-full rounded-md bg-muted p-4 font-mono text-xs">
                    <div className="text-muted-foreground">
                      $ router configure --ip 192.168.1.1 --dhcp enable
                    </div>
                    <div className="mt-2 text-foreground">
                      Router configured successfully
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      $ firewall add-rule --port 80 --allow
                    </div>
                    <div className="mt-2 text-foreground">
                      Firewall rule added: Port 80 allowed
                    </div>
                    <div className="mt-2 text-muted-foreground">
                      $ firewall add-rule --port 443 --allow
                    </div>
                    <div className="mt-2 text-foreground">
                      Firewall rule added: Port 443 allowed
                    </div>
                    <div className="mt-2 text-muted-foreground">$</div>
                  </div>
                </TabsContent>
                <TabsContent
                  className="mt-4 h-[calc(100%-60px)]"
                  value="network"
                >
                  <div className="flex h-full items-center justify-center rounded-md border border-dashed bg-muted/50">
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">
                        Network Topology
                      </p>
                      <p className="mt-2 text-muted-foreground text-xs">
                        Visual representation of network devices and connections
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent
                  className="mt-4 h-[calc(100%-60px)]"
                  value="output"
                >
                  <div className="h-full space-y-2 overflow-auto rounded-md bg-muted p-4 text-xs">
                    <div className="text-foreground">
                      ✓ Router configured: 192.168.1.1
                    </div>
                    <div className="text-foreground">✓ DHCP enabled</div>
                    <div className="text-foreground">
                      ✓ Firewall rule added: Port 80 allowed
                    </div>
                    <div className="text-foreground">
                      ✓ Firewall rule added: Port 443 allowed
                    </div>
                    <div className="text-foreground">
                      ✓ Default deny policy applied
                    </div>
                    <div className="mt-4 text-muted-foreground">
                      Waiting for next command...
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
