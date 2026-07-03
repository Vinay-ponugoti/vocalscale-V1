import React, { createContext, useContext, useLayoutEffect } from 'react';

/**
 * Shared layout-options plumbing for the persistent dashboard shell.
 *
 * The chrome (sidebar + header) is mounted once by DashboardShell. Pages keep using
 * <DashboardLayout fullWidth>…</DashboardLayout> as before, but that wrapper is now a
 * thin component that just forwards these options up to the shell — it no longer renders
 * the sidebar itself, so navigating between pages doesn't remount the sidebar/upgrade popup.
 */

export interface LayoutOptions {
  fullWidth?: boolean;
  secondaryNav?: React.ReactNode;
  hideHeader?: boolean;
}

export const SetLayoutOptionsContext = createContext<(o: LayoutOptions) => void>(() => {});

/**
 * Forward the current page's layout options to the persistent shell.
 * Applied via useLayoutEffect so options take effect before paint (no flash).
 * Pass a memoized value for `secondaryNav` to avoid redundant updates.
 */
export function useDashboardLayout(options: LayoutOptions = {}): void {
  const setOptions = useContext(SetLayoutOptionsContext);
  const fullWidth = options.fullWidth ?? false;
  const hideHeader = options.hideHeader ?? false;
  const secondaryNav = options.secondaryNav ?? null;

  useLayoutEffect(() => {
    setOptions({ fullWidth, hideHeader, secondaryNav });
    return () => setOptions({});
  }, [setOptions, fullWidth, hideHeader, secondaryNav]);
}
