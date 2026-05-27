import { Suspense } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { JournalStoreProvider } from "@/lib/journal-store";
import { ActiveTimerProvider } from "@/lib/active-timer";

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <JournalStoreProvider>
        <ActiveTimerProvider>
          <MobileFrame>
            <main className="flex-1 overflow-y-auto">{children}</main>
            <BottomTabBar />
          </MobileFrame>
        </ActiveTimerProvider>
      </JournalStoreProvider>
    </Suspense>
  );
}
