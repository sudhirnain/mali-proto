import { Suspense } from "react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomTabBar } from "@/components/BottomTabBar";
import { JournalStoreProvider } from "@/lib/journal-store";
import { ActiveTimerProvider } from "@/lib/active-timer";
import { ContractionSessionProvider } from "@/lib/contraction-session";

export default function PrototypeLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <JournalStoreProvider>
        <ActiveTimerProvider>
          <ContractionSessionProvider>
            <MobileFrame>
              <main id="phone-scroll" className="flex-1 overflow-y-auto">{children}</main>
              <BottomTabBar />
            </MobileFrame>
          </ContractionSessionProvider>
        </ActiveTimerProvider>
      </JournalStoreProvider>
    </Suspense>
  );
}
