import { SettingsContent } from "./settings/SettingsContent";
import { SettingsProps } from "@/types/settings";

interface DesktopSettingsSidebarProps {
  settingsProps: SettingsProps;
}

export function DesktopSettingsSidebar({
  settingsProps,
}: DesktopSettingsSidebarProps) {
  return (
    <aside className="hidden md:flex w-80 border-l bg-card flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <SettingsContent {...settingsProps} />
      </div>
    </aside>
  );
}
