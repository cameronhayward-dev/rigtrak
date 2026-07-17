"use client";

import { useStore } from "@/context/store";
import Modal from "./Modal";

const pickBtn =
  "min-h-15 w-full cursor-pointer rounded-app border border-edge bg-panel p-4 text-left text-base font-semibold text-fg active:bg-orange active:text-white";

export default function LocationPickModal() {
  const { locations, assets, closeModal, pickLocationForCheck } = useStore();

  return (
    <Modal title="Which location are you checking?" onClose={closeModal}>
      <div className="flex max-h-[55vh] flex-col gap-2 overflow-y-auto">
        {locations.map((l) => {
          const count = assets.filter((a) => a.location === l.name && a.name).length;
          return (
            <button key={l.id} className={pickBtn} onClick={() => pickLocationForCheck(l.name)}>
              <div>{l.name}</div>
              <div className="mt-[3px] text-[13px] font-normal text-dim">
                {count} registered asset{count !== 1 ? "s" : ""}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
