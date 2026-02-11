"use client";

import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export function AccountPreferences() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      {/* Appearance */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground text-sm">
                Appearance
              </h3>
              <p className="text-muted-foreground text-xs">
                Choose how the app looks. Select a theme that suits your
                preference.
              </p>
            </div>
            <Select
              onValueChange={(v) => {
                if (v) setTheme(v);
              }}
              value={theme ?? "system"}
            >
              <SelectTrigger className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Email notifications
            </h3>
            <p className="text-muted-foreground text-xs">
              Choose which emails you'd like to receive from us.
            </p>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-border">
            <SettingRow
              defaultChecked
              description="Get notified when courses you're enrolled in are updated."
              title="Course updates"
            />
            <SettingRow
              defaultChecked
              description="Receive reminders about incomplete courses and upcoming deadlines."
              title="Course reminders"
            />
            <SettingRow
              defaultChecked
              description="A weekly summary of your learning progress and activity."
              title="Weekly digest"
            />
            <SettingRow
              defaultChecked={false}
              description="Receive news, promotions, and feature announcements."
              title="Marketing emails"
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground text-sm">Language</h3>
              <p className="text-muted-foreground text-xs">
                Set the display language for the interface.
              </p>
            </div>
            <Select defaultValue="en">
              <SelectTrigger className="w-40 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English (US)</SelectItem>
                <SelectItem value="en-gb">English (UK)</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Time zone */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">Time zone</h3>
            <p className="text-muted-foreground text-xs">
              Defines the default time zone used for displaying times in the
              app.
            </p>
          </div>
          <div className="mt-4">
            <SettingRow
              defaultChecked
              description="Automatically use your device's current timezone."
              title="Use device timezone"
            />
          </div>
        </CardContent>
      </Card>

      {/* Time Display Format */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground text-sm">
                Time display format
              </h3>
              <p className="text-muted-foreground text-xs">
                Choose between 12-hour or 24-hour clock format for displaying
                time.
              </p>
            </div>
            <Select defaultValue="12">
              <SelectTrigger className="w-32 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Date Display Format */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h3 className="font-medium text-foreground text-sm">
                Date display format
              </h3>
              <p className="text-muted-foreground text-xs">
                Select the format used to display dates throughout the app.
              </p>
            </div>
            <Select defaultValue="mm-dd-yyyy">
              <SelectTrigger className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Start week on Monday */}
      <Card>
        <CardContent>
          <SettingRow
            defaultChecked={false}
            description="Use Monday as the first day of the week in calendars and schedules."
            title="Start week on Monday"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  title,
  description,
  defaultChecked = false,
}: {
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-foreground text-xs">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}
