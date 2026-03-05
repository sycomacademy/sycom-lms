import { CircleHelpIcon, type CircleHelpIconHandle } from "./circle-help";
import {
  MessageSquareMoreIcon,
  type MessageSquareMoreIconHandle,
} from "./feedback";
import { HomeIcon, type HomeIconHandle } from "./home";
import { LogoutIcon, type LogoutIconHandle } from "./logout";
import { MenuIcon, type MenuIconHandle } from "./menu-icon";
import {
  PanelLeftCloseIcon,
  type PanelLeftCloseIconHandle,
} from "./panel-left-close";
import {
  PanelLeftOpenIcon,
  type PanelLeftOpenIconHandle,
} from "./panel-left-open";
import { SettingsIcon, type SettingsIconHandle } from "./settings";
import { ThemeToggleIcon, type ThemeToggleIconHandle } from "./theme-toggle";
import { UserIcon, type UserIconHandle } from "./user";

interface IconHandles {
  MessageSquareMoreIcon: MessageSquareMoreIconHandle;
  PanelLeftCloseIcon: PanelLeftCloseIconHandle;
  PanelLeftOpenIcon: PanelLeftOpenIconHandle;
  HomeIcon: HomeIconHandle;
  CircleHelpIcon: CircleHelpIconHandle;
  LogoutIcon: LogoutIconHandle;
  MenuIcon: MenuIconHandle;
  SettingsIcon: SettingsIconHandle;
  ThemeToggleIcon: ThemeToggleIconHandle;
  UserIcon: UserIconHandle;
}

const Icons = {
  MessageSquareMoreIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  HomeIcon,
  CircleHelpIcon,
  LogoutIcon,
  MenuIcon,
  SettingsIcon,
  ThemeToggleIcon,
  UserIcon,
};

export { Icons as Icon, type IconHandles };
