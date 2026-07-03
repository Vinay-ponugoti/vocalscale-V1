import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DashboardChrome } from './DashboardLayout';
import { SetLayoutOptionsContext, type LayoutOptions } from './layoutOptions';

/**
 * Persistent dashboard shell.
 *
 * DashboardChrome (sidebar, header, upgrade popup, subscription query) is mounted ONCE
 * here; child pages render inside it via <Outlet/>. Navigating between pages no longer
 * remounts the sidebar — the upgrade popup stops "reloading" and the collapse state is
 * preserved. Pages still use <DashboardLayout> as before; that wrapper now just forwards
 * its options into the `options` state below.
 */
export const DashboardShell: React.FC = () => {
  const [options, setOptions] = useState<LayoutOptions>({});

  return (
    <SetLayoutOptionsContext.Provider value={setOptions}>
      <DashboardChrome
        fullWidth={options.fullWidth}
        hideHeader={options.hideHeader}
        secondaryNav={options.secondaryNav}
      >
        <Outlet />
      </DashboardChrome>
    </SetLayoutOptionsContext.Provider>
  );
};

export default DashboardShell;
