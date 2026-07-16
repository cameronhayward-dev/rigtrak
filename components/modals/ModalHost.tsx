"use client";

import { useStore } from "@/context/store";
import AssetModal from "./AssetModal";
import ViewModal from "./ViewModal";
import ImportModal from "./ImportModal";
import SettingsModal from "./SettingsModal";
import MatchModal from "./MatchModal";
import LocationPickModal from "./LocationPickModal";
import LocationViewModal from "./LocationViewModal";

export default function ModalHost() {
  const { modal } = useStore();

  switch (modal.type) {
    case "edit":
      return <AssetModal assetId={modal.assetId} />;
    case "view":
      return <ViewModal assetId={modal.assetId} />;
    case "import":
      return <ImportModal />;
    case "settings":
      return <SettingsModal />;
    case "match":
      return <MatchModal stubId={modal.stubId} />;
    case "locationPick":
      return <LocationPickModal />;
    case "locationView":
      return <LocationViewModal locationName={modal.locationName} />;
    default:
      return null;
  }
}
