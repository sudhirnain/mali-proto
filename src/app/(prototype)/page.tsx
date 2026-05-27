import { redirect } from "next/navigation";

/**
 * Root → /feed. The prototype index (screen catalog + entry-form jump list)
 * was useful during development; for the shareable demo, anyone landing on
 * the root should drop into the actual app. The DemoNavigator (mounted in
 * MobileFrame) carries the dev-time jump links.
 */
export default function Page() {
  redirect("/feed");
}
