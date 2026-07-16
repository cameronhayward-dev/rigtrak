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

      <div className="container">
        <StatsBar />
        <Tabs />

        {tab === "assets" && <AssetsView />}
        {tab === "scan" && <ScanView />}
        {tab === "locations" && <LocationsView />}
        {tab === "report" && <ReportView />}
      </div>

      <button className="fab" onClick={openAdd} aria-label="Add asset">
        +
      </button>

      <ModalHost />
      <Toaster />
    </>
  );
}
