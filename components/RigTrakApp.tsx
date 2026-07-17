"use client";

import { useStore } from "@/context/store";
import Header from "./Header";
import StatsBar from "./StatsBar";
import Tabs from "./Tabs";
import AssetsView from "./AssetsView";
import ScanView from "./ScanView";
import LocationsView from "./LocationsView";
import ReportView from "./ReportView";
import Toaster from "./Toaster";
import ModalHost from "./modals/ModalHost";

export default function RigTrakApp() {
  const { tab, openAdd } = useStore();

  return (
    <>
      <Header />

      <div className="max-w-[900px] mx-auto p-4">
        <StatsBar />
        <Tabs />

        {tab === "assets" && <AssetsView />}
        {tab === "scan" && <ScanView />}
        {tab === "locations" && <LocationsView />}
        {tab === "report" && <ReportView />}
      </div>

      {/* Mobile-only: the desktop layout has the Add button in the header. */}
      <button
        className="fixed bottom-6 right-4 z-50 flex h-15 w-15 cursor-pointer items-center justify-center rounded-full bg-orange text-[30px] text-white shadow-[0_4px_20px_rgba(244,107,26,0.5)] app:hidden"
        onClick={openAdd}
        aria-label="Add asset"
      >
        +
      </button>

      <ModalHost />
      <Toaster />
    </>
  );
}
