import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SettingsContent } from "./settings/SettingsContent";

interface MobileSettingsSheetProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}

export function MobileSettingsSheet({
  mobileMenuOpen,
  setMobileMenuOpen,
}: MobileSettingsSheetProps) {
  return (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <button
          className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full bg-card border-2 border-border hover:bg-accent transition-all shadow-2xl flex items-center gap-2"
          aria-label="Открыть настройки"
        >
          <Menu className="w-5 h-5" />
          <span className="text-sm font-medium">Настройки</span>
        </button>
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="md:hidden h-[85vh] p-0 rounded-t-2xl"
      >
        <div className="h-full flex flex-col">
          {/* Ручка для свайпа */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Скрытый заголовок для accessibility */}
          <SheetTitle className="sr-only">Настройки глобуса</SheetTitle>

          {/* Контент настроек с прокруткой */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <SettingsContent />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
