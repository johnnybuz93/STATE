import { SettingsContent } from "./settings/SettingsContent";

export function DesktopSettingsSidebar() {
  return (
    <aside className="hidden md:flex w-80 border-l bg-card flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <SettingsContent />
      </div>
    </aside>
  );
}
