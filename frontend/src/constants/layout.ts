/**
 * Shared layout constants to ensure visual consistency across the application.
 */

// Consistent page padding for all dashboard screens
// p-4 (16px) on mobile -> p-6 (24px) md -> p-8 (32px) lg+.
// Capped at 32px so laptop viewports keep more usable height/width.
export const PAGE_PADDING = "p-4 md:p-6 lg:p-8";

// Content column for every scrolling page (inside the shell's padded <main>).
// Every page shares one width so headers and cards line up when switching pages.
export const PAGE_CONTAINER = "mx-auto w-full max-w-7xl space-y-6";

// Full-height workspace pages (split panes, calendars): same padding, no max width.
export const WORKSPACE_CONTAINER = "flex h-full min-h-0 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8";

// Consistent gap for card grids: 16px -> 24px
export const GRID_GAP = "gap-4 lg:gap-6";

// The one card surface. Prefer <Card> from components/ui/Card when it's a plain div.
export const CARD = "rounded-xl border border-slate-200 bg-white shadow-sm";
