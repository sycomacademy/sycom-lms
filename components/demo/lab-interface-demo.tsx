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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function LabInterfaceDemo() {
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
      <div className="grid flex-1 grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
            <CardDescription>
              Follow these steps to complete the lab
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Step 1: Configure Router</h4>
              <p className="text-muted-foreground text-xs">
                Set up the router with IP address 192.168.1.1 and enable DHCP.
              </p>
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
            </div>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Step 3: Test Connectivity</h4>
              <p className="text-muted-foreground text-xs">
                Verify that devices can communicate through the configured
                network.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lab Environment</CardTitle>
            <CardDescription>
              Interactive terminal and network simulator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="terminal">
              <TabsList>
                <TabsTrigger value="terminal">Terminal</TabsTrigger>
                <TabsTrigger value="network">Network View</TabsTrigger>
                <TabsTrigger value="output">Output</TabsTrigger>
              </TabsList>
              <TabsContent className="mt-4" value="terminal">
                <div className="rounded-md bg-muted p-4 font-mono text-xs">
                  <div className="text-muted-foreground">
                    $ router configure --ip 192.168.1.1
                  </div>
                  <div className="mt-2 text-foreground">
                    Router configured successfully
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    $ firewall add-rule --port 80 --allow
                  </div>
                  <div className="mt-2 text-foreground">
                    Firewall rule added
                  </div>
                  <div className="mt-2 text-muted-foreground">$</div>
                </div>
              </TabsContent>
              <TabsContent className="mt-4" value="network">
                <div className="flex h-64 items-center justify-center rounded-md border border-dashed bg-muted/50">
                  <p className="text-muted-foreground text-sm">
                    Network topology visualization
                  </p>
                </div>
              </TabsContent>
              <TabsContent className="mt-4" value="output">
                <div className="space-y-2 rounded-md bg-muted p-4 text-xs">
                  <div className="text-foreground">
                    ✓ Router configured: 192.168.1.1
                  </div>
                  <div className="text-foreground">
                    ✓ Firewall rule added: Port 80 allowed
                  </div>
                  <div className="text-muted-foreground">
                    Waiting for next command...
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
