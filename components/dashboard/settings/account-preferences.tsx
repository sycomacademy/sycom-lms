"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toastManager } from "@/components/ui/toast";
import { useUserMutation, useUserQuery } from "@/packages/hooks/use-user";
import { capitalize } from "@/packages/utils/string";

export function AccountPreferences() {
  const { theme, setTheme } = useTheme();
  const { profile } = useUserQuery();
  const mutation = useUserMutation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const themeValue = theme ?? "system";
  const selectValue = mounted ? capitalize(themeValue) : "System";

  const marketingEmails = profile?.settings?.marketingEmails ?? true;
  const useDeviceTimezone = profile?.settings?.useDeviceTimezone ?? true;
  const enableFacehash = profile?.settings?.enableFacehash ?? true;

  const updateSettings = (nextSettings: Record<string, boolean>) => {
    mutation.mutate(
      {
        settings: {
          ...profile?.settings,
          ...nextSettings,
        },
      },
      {
        onSuccess: () => {
          toastManager.add({
            title: "Preferences updated",
            type: "success",
          });
        },
      }
    );
  };

  const handleMarketingEmailsChange = (checked: boolean) => {
    updateSettings({ marketingEmails: checked });
  };

  const handleUseDeviceTimezoneChange = (checked: boolean) => {
    updateSettings({ useDeviceTimezone: checked });
  };

  const handleEnableFacehashChange = (checked: boolean) => {
    updateSettings({ enableFacehash: checked });
  };

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
                if (v) {
                  setTheme(v);
                }
              }}
              value={selectValue}
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

      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              Email preferences
            </h3>
            <p className="text-muted-foreground text-xs">
              Control whether we send occasional welcome, product, and
              promotional emails.
            </p>
          </div>
          <div className="mt-4">
            <SettingRow
              checked={marketingEmails}
              description="Receive occasional welcome, product, and promotional emails from Sycom LMS."
              disabled={mutation.isPending}
              onCheckedChange={handleMarketingEmailsChange}
              title="Marketing emails"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      {/* <Card>
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
      </Card> */}

      {/* Language & Region */}
      {/* <Card>
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
      </Card> */}

      {/* Time zone */}
      <Card>
        <CardContent>
          <div className="flex flex-col gap-1.5">
            <h3 className="font-medium text-foreground text-sm">
              User preferences
            </h3>
            <p className="text-muted-foreground text-xs">
              Configure your user preferences.
            </p>
          </div>
          <div className="mt-4">
            <SettingRow
              checked={useDeviceTimezone}
              description="Automatically use your device's current timezone. This will be used to personalize the user experience."
              disabled={mutation.isPending}
              onCheckedChange={handleUseDeviceTimezoneChange}
              title="Use device timezone"
            />
            <SettingRow
              checked={enableFacehash}
              description="If no profile picture is set, use FaceHash to generate a random profile picture."
              disabled={mutation.isPending}
              onCheckedChange={handleEnableFacehashChange}
              title="Enable FaceHash"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-0.5">
        <p className="font-medium text-foreground text-xs">{title}</p>
        <p className="text-muted-foreground text-xs">{description}</p>
      </div>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
