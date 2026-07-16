"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import {
  assetsCol,
  checkoutsCol,
  companyDocRef,
  db,
  formatRigTrakId,
  inspectorsCol,
  locationsCol,
  reserveRigTrakIds,
  scansCol,
} from "@/lib/firebase";
import { deriveComplianceFields, getSerial, mapAssetStatus, parseDateLoose } from "@/lib/helpers";
import {
  DEFAULT_LOCATIONS,
  type Asset,
  type CheckData,
  type Checkout,
  type CompanyProfile,
  type HuntTarget,
  type InoutState,
  type Inspector,
  type Location,
  type RegisterRow,
  type ScanContext,
  type ScanHubState,
  type SessionItem,
  type SortKey,
  type TabKey,
  type UnexpectedItem,
} from "@/lib/types";

type ToastType = "info" | "success" | "error";
interface ToastAction {
  label: string;
  onClick: () => void | Promise<void>;
}
export interface Toast {
  id: number;
  msg: string;
  type: ToastType;
  action?: ToastAction;
}

export type Modal =
  | { type: "none" }
  | { type: "edit"; assetId: string | null } // null => manual add
  | { type: "view"; assetId: string }
  | { type: "import" }
  | { type: "settings" }
  | { type: "match"; stubId: string }
  | { type: "locationPick" }
  | { type: "locationView"; locationName: string };

interface StoreValue {
  // data
  assets: Asset[];
  locations: Location[];
  inspectors: Inspector[];
  checkouts: Checkout[];
  company: CompanyProfile;
  loading: boolean;

  // tabs & scan hub navigation
  tab: TabKey;
  switchTab: (t: TabKey) => void;
  scanHubState: ScanHubState;
  switchScanView: (v: ScanHubState) => void;
  backToScanMenu: () => void;

  // assets toolbar
  search: string;
  setSearch: (s: string) => void;
  statusFilter: string;
  setStatusFilter: (s: string) => void;
  locationFilter: string;
  setLocationFilter: (s: string) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  filterByStatus: (status: string) => void;
  filterDueSoon: () => void;
  alertJumpTo: (kind: "overdue" | "expiring" | "quarantine") => void;

  // selection
  selectedIds: Set<string>;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  toggleSelectAll: (checked: boolean, visibleIds: string[]) => void;

  // modals
  modal: Modal;
  openAdd: () => void;
  openEdit: (id: string) => void;
  openView: (id: string) => void;
  openImport: () => void;
  openSettings: () => void;
  openMatch: (stubId: string) => void;
  openLocationPick: () => void;
  openLocationView: (name: string) => void;
  closeModal: () => void;

  // scanning
  scanContext: ScanContext;
  toggleScanMode: () => void;

  // location check
  checkLocationName: string | null;
  liveCheckEpcs: Set<string>;
  checkData: CheckData | null;
  pickLocationForCheck: (name: string) => void;
  stopLiveCheck: () => void;

  // check out / check in / find
  inoutState: InoutState;
  goToInoutState: (s: InoutState) => void;
  checkoutDestination: string;
  checkoutSessionItems: SessionItem[];
  checkinReturnLocation: string;
  checkinSessionItems: SessionItem[];
  beginCheckout: (destination: string) => void;
  beginCheckin: (location: string) => void;
  huntTargets: HuntTarget[];
  huntFoundEpcs: Set<string>;
  huntSelectedIds: Set<string>;
  huntToggleSelect: (id: string) => void;
  huntSelectAllMatches: (ids: string[]) => void;
  beginHunt: () => void;
  stopInoutSession: () => void;

  // import review banner
  importReviewCount: number | null;
  dismissImportBanner: () => void;
  reviewImportedAssets: () => void;

  // toasts
  toasts: Toast[];
  toast: (msg: string, type?: ToastType, action?: ToastAction) => void;
  dismissToast: (id: number) => void;

  // actions
  saveAsset: (id: string | null, data: Partial<Asset>) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  resolveQuarantine: (id: string, status: string) => Promise<void>;
  confirmMatch: (stubId: string, targetId: string) => Promise<void>;
  bulkSetLocation: (location: string) => Promise<void>;
  bulkSetStatus: (status: string) => Promise<void>;
  bulkDelete: () => Promise<void>;
  addLocation: (name: string) => Promise<void>;
  addLocationInline: (name: string) => Promise<string | null>;
  deleteLocation: (id: string, name: string) => Promise<void>;
  cleanUpDuplicateLocations: () => Promise<void>;
  addInspector: (data: Omit<Inspector, "id" | "createdAt">) => Promise<void>;
  deleteInspector: (id: string, name: string) => Promise<void>;
  saveCompanyProfile: (data: CompanyProfile) => Promise<void>;
  importRegisterRows: (rows: RegisterRow[]) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [checkouts, setCheckouts] = useState<Checkout[]>([]);
  const [company, setCompany] = useState<CompanyProfile>({});
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<TabKey>("assets");
  const [scanHubState, setScanHubState] = useState<ScanHubState>("menu");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<Modal>({ type: "none" });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [importReviewCount, setImportReviewCount] = useState<number | null>(null);

  const [scanContext, setScanContext] = useState<ScanContext>(null);
  const [checkLocationName, setCheckLocationName] = useState<string | null>(null);
  const [liveCheckEpcs, setLiveCheckEpcs] = useState<Set<string>>(new Set());

  const [inoutState, setInoutState] = useState<InoutState>("menu");
  const [checkoutDestination, setCheckoutDestination] = useState("");
  const [checkoutSessionItems, setCheckoutSessionItems] = useState<SessionItem[]>([]);
  const [checkinReturnLocation, setCheckinReturnLocation] = useState("");
  const [checkinSessionItems, setCheckinSessionItems] = useState<SessionItem[]>([]);
  const [huntTargets, setHuntTargets] = useState<HuntTarget[]>([]);
  const [huntFoundEpcs, setHuntFoundEpcs] = useState<Set<string>>(new Set());
  const [huntSelectedIds, setHuntSelectedIds] = useState<Set<string>>(new Set());

  const toast = useCallback((msg: string, type: ToastType = "info", action?: ToastAction) => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, msg, type, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), action ? 6000 : 3500);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  // Latest values reachable from the scan listener without re-subscribing.
  const assetsRef = useRef<Asset[]>(assets);
  assetsRef.current = assets;
  const checkoutsRef = useRef<Checkout[]>(checkouts);
  checkoutsRef.current = checkouts;
  const locationsRef = useRef<Location[]>(locations);
  locationsRef.current = locations;
  const scanContextRef = useRef<ScanContext>(scanContext);
  scanContextRef.current = scanContext;
  const scanHubStateRef = useRef<ScanHubState>(scanHubState);
  scanHubStateRef.current = scanHubState;
  const liveCheckEpcsRef = useRef<Set<string>>(liveCheckEpcs);
  liveCheckEpcsRef.current = liveCheckEpcs;
  const huntTargetsRef = useRef<HuntTarget[]>(huntTargets);
  huntTargetsRef.current = huntTargets;
  const huntFoundEpcsRef = useRef<Set<string>>(huntFoundEpcs);
  huntFoundEpcsRef.current = huntFoundEpcs;
  const checkoutDestinationRef = useRef(checkoutDestination);
  checkoutDestinationRef.current = checkoutDestination;
  const checkinReturnLocationRef = useRef(checkinReturnLocation);
  checkinReturnLocationRef.current = checkinReturnLocation;

  /**
   * Only one scanning mode can be active at a time — Scan Mode, Check, Check Out,
   * Check In, or Hunt — so a single scan can never be picked up by two different
   * features at once. Starting any mode automatically stops whichever was running.
   */
  const setActiveScanContext = useCallback((next: ScanContext) => {
    scanContextRef.current = next;
    setScanContext(next);
  }, []);

  // ── LISTENERS ────────────────────────────────────────────────────────

  useEffect(() => {
    const unsub = onSnapshot(query(assetsCol, orderBy("createdAt", "desc")), (snap) => {
      setAssets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Asset, "id">) })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(checkoutsCol, orderBy("checkedOutAt", "desc")), (snap) => {
      setCheckouts(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Checkout, "id">) })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(inspectorsCol, orderBy("name", "asc")), (snap) => {
      setInspectors(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Inspector, "id">) })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(companyDocRef, (snap) => {
      setCompany(snap.exists() ? (snap.data() as CompanyProfile) : {});
    });
    return () => unsub();
  }, []);

  // Seeding guard: this listener fires on every change to the locations list —
  // including the very first moment the app connects, when the list is momentarily
  // empty simply because nothing has loaded yet. Without this guard the app
  // mistakes that for "no locations exist" and creates a fresh set of defaults,
  // which is how duplicate locations appeared.
  const hasSeededLocations = useRef(false);
  useEffect(() => {
    const unsub = onSnapshot(query(locationsCol, orderBy("name", "asc")), async (snap) => {
      const locs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Location, "id">) }));
      setLocations(locs);
      // Only seed when Firestore has confirmed this is real, settled data (not a
      // cached/pending first paint) AND we haven't already seeded this session.
      if (
        locs.length === 0 &&
        !snap.metadata.fromCache &&
        !snap.metadata.hasPendingWrites &&
        !hasSeededLocations.current
      ) {
        hasSeededLocations.current = true;
        const batch = writeBatch(db);
        DEFAULT_LOCATIONS.forEach((name) => {
          batch.set(doc(locationsCol), { name, createdAt: new Date().toISOString() });
        });
        await batch.commit();
      }
    });
    return () => unsub();
  }, []);

  // Fixes assets whose location text is a near-match to a real location (e.g.
  // "backpack" typed before the "Backpack" dropdown option existed) so they show
  // up under the right location instead of appearing missing.
  const normalizing = useRef(false);
  useEffect(() => {
    if (normalizing.current || !locations.length || !assets.length) return;
    const canonicalMap = new Map(locations.map((l) => [l.name.trim().toLowerCase(), l.name]));
    const mismatched = assets.filter((a) => {
      if (!a.location) return false;
      const canonical = canonicalMap.get(a.location.trim().toLowerCase());
      return canonical && canonical !== a.location;
    });
    if (!mismatched.length) return;

    normalizing.current = true;
    const batch = writeBatch(db);
    mismatched.forEach((a) => {
      batch.update(doc(db, "assets", a.id), {
        location: canonicalMap.get(a.location.trim().toLowerCase()),
      });
    });
    batch.commit().finally(() => {
      normalizing.current = false;
    });
  }, [assets, locations]);

  // ── SCAN DISPATCH ────────────────────────────────────────────────────

  const registerStubTag = useCallback(async (epc: string) => {
    const rtId = formatRigTrakId(await reserveRigTrakIds(1));
    const now = new Date().toISOString();
    await addDoc(assetsCol, {
      epc,
      name: "",
      location: "",
      description: "",
      status: "Unregistered",
      complianceDate: null,
      rigtrakId: rtId,
      createdAt: now,
      updatedAt: now,
    });
  }, []);

  const handleCheckoutScan = useCallback(
    async (epc: string) => {
      const asset = assetsRef.current.find((a) => a.epc === epc && a.name);
      if (!asset) {
        await registerStubTag(epc);
        toast("Unregistered tag scanned — added to Needs Action", "info");
        return;
      }
      const now = new Date().toISOString();
      const destination = checkoutDestinationRef.current;
      await addDoc(checkoutsCol, {
        assetId: asset.id,
        epc,
        rigtrakId: asset.rigtrakId || "",
        assetName: asset.name,
        destination,
        checkedOutAt: now,
        checkedInAt: null,
      });
      await updateDoc(doc(db, "assets", asset.id), {
        checkedOut: true,
        checkedOutTo: destination,
        updatedAt: now,
      });
      setCheckoutSessionItems((items) => [{ name: asset.name, serial: getSerial(asset), time: now }, ...items]);
      toast(`✓ ${asset.name} checked out`, "success");
    },
    [registerStubTag, toast]
  );

  const handleCheckinScan = useCallback(
    async (epc: string) => {
      const asset = assetsRef.current.find((a) => a.epc === epc && a.name);
      if (!asset) {
        toast("Unregistered tag — nothing to check in", "error");
        return;
      }
      const now = new Date().toISOString();
      const returnTo = checkinReturnLocationRef.current;
      const openCheckout = checkoutsRef.current.find((c) => c.assetId === asset.id && !c.checkedInAt);
      if (openCheckout) {
        await updateDoc(doc(db, "checkouts", openCheckout.id), { checkedInAt: now });
      }
      await updateDoc(doc(db, "assets", asset.id), {
        checkedOut: false,
        checkedOutTo: null,
        location: returnTo,
        updatedAt: now,
      });
      setCheckinSessionItems((items) => [{ name: asset.name, serial: getSerial(asset), time: now }, ...items]);
      toast(`✓ ${asset.name} checked in to ${returnTo}`, "success");
    },
    [toast]
  );

  const handleHuntScan = useCallback(
    (epc: string) => {
      const target = huntTargetsRef.current.find((t) => t.epc === epc);
      if (!target || huntFoundEpcsRef.current.has(epc)) return;
      const next = new Set(huntFoundEpcsRef.current);
      next.add(epc);
      huntFoundEpcsRef.current = next;
      setHuntFoundEpcs(next);
      const foundCount = huntTargetsRef.current.filter((t) => next.has(t.epc)).length;
      toast(`Found: ${target.name} (${foundCount} of ${huntTargetsRef.current.length})`, "success");
    },
    [toast]
  );

  const dispatchScan = useCallback(
    async (epc: string) => {
      switch (scanContextRef.current) {
        case "scanMode": {
          const existing = assetsRef.current.find((a) => a.epc === epc);
          if (existing) {
            toast(`✓ Scanned: ${existing.name || "Unmatched tag"}`, "success");
          } else {
            await registerStubTag(epc);
            toast("New tag scanned — added to Needs Action", "info");
          }
          break;
        }
        case "check": {
          if (liveCheckEpcsRef.current.has(epc)) return;
          const next = new Set(liveCheckEpcsRef.current);
          next.add(epc);
          liveCheckEpcsRef.current = next;
          setLiveCheckEpcs(next);
          // A scanned tag with no matching asset anywhere gets added to Needs
          // Action immediately, same as normal Scan Mode — so nothing gets lost
          // once you leave the Check tab.
          if (!assetsRef.current.find((a) => a.epc === epc)) await registerStubTag(epc);
          break;
        }
        case "checkout":
          await handleCheckoutScan(epc);
          break;
        case "checkin":
          await handleCheckinScan(epc);
          break;
        case "hunt":
          handleHuntScan(epc);
          break;
        default:
          break; // no mode active — ignore
      }
    },
    [handleCheckinScan, handleCheckoutScan, handleHuntScan, registerStubTag, toast]
  );

  const dispatchScanRef = useRef(dispatchScan);
  dispatchScanRef.current = dispatchScan;

  /**
   * The one and only scan listener. Every scan from the reader passes through
   * here and gets routed based on whichever mode is currently active.
   *
   * We don't filter "new" scans by comparing timestamps — the reader app writes
   * its own time value and we can't rely on its exact format matching what the
   * browser expects, so a value-comparison silently misfires. Instead we treat
   * the very first snapshot (whatever's already sitting in the collection when
   * the app opens) as "old", mark it all as handled without reacting to it, and
   * only dispatch scans that arrive afterwards.
   */
  useEffect(() => {
    const handledScanDocIds = new Set<string>();
    let backlogCleared = false;
    const unsub = onSnapshot(query(scansCol, orderBy("timestamp", "desc")), (snap) => {
      if (!backlogCleared) {
        snap.docChanges().forEach((change) => handledScanDocIds.add(change.doc.id));
        backlogCleared = true;
        return;
      }
      snap.docChanges().forEach((change) => {
        if (change.type !== "added") return;
        if (handledScanDocIds.has(change.doc.id)) return;
        handledScanDocIds.add(change.doc.id);
        dispatchScanRef.current((change.doc.data() as { epc: string }).epc);
      });
    });
    return () => unsub();
  }, []);

  // ── NAVIGATION ───────────────────────────────────────────────────────

  const switchTab = useCallback((t: TabKey) => setTab(t), []);
  const switchScanView = useCallback((v: ScanHubState) => setScanHubState(v), []);

  const stopLiveCheck = useCallback(() => {
    setActiveScanContext(null);
    setLiveCheckEpcs(new Set());
    setCheckLocationName(null);
  }, [setActiveScanContext]);

  const resetHunt = useCallback(() => {
    setHuntTargets([]);
    setHuntFoundEpcs(new Set());
    setHuntSelectedIds(new Set());
  }, []);

  const backToScanMenu = useCallback(() => {
    // Leaving Check or In/Out mid-session should stop whatever's actively scanning.
    if (scanHubStateRef.current === "check") stopLiveCheck();
    if (scanHubStateRef.current === "inout") {
      setActiveScanContext(null);
      setInoutState("menu");
      resetHunt();
    }
    setScanHubState("menu");
    setTab("scan");
  }, [resetHunt, setActiveScanContext, stopLiveCheck]);

  // ── FILTERS ──────────────────────────────────────────────────────────

  const filterByStatus = useCallback((status: string) => {
    setTab("assets");
    setStatusFilter(status);
  }, []);

  const filterDueSoon = useCallback(() => {
    setTab("assets");
    setStatusFilter("");
    setSearch("");
    setSort("compliance");
  }, []);

  const alertJumpTo = useCallback((kind: "overdue" | "expiring" | "quarantine") => {
    setTab("assets");
    setSearch("");
    setLocationFilter("");
    if (kind === "quarantine") {
      setStatusFilter("Quarantine");
      setSort("name");
    } else {
      setStatusFilter("");
      setSort("compliance");
    }
  }, []);

  // ── SELECTION ────────────────────────────────────────────────────────

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  /**
   * Selects (or clears) every asset currently visible under the active
   * search/filter — not literally every asset in the system — so it does what
   * you'd expect if you've filtered down to one location first.
   */
  const toggleSelectAll = useCallback((checked: boolean, visibleIds: string[]) => {
    setSelectedIds((prev) => (checked ? new Set([...prev, ...visibleIds]) : new Set()));
  }, []);

  // ── MODALS ───────────────────────────────────────────────────────────

  const openAdd = useCallback(() => setModal({ type: "edit", assetId: null }), []);
  const openEdit = useCallback((id: string) => setModal({ type: "edit", assetId: id }), []);
  const openView = useCallback((id: string) => setModal({ type: "view", assetId: id }), []);
  const openImport = useCallback(() => setModal({ type: "import" }), []);
  const openSettings = useCallback(() => setModal({ type: "settings" }), []);
  const openMatch = useCallback((stubId: string) => setModal({ type: "match", stubId }), []);
  const openLocationPick = useCallback(() => setModal({ type: "locationPick" }), []);
  const openLocationView = useCallback(
    (locationName: string) => setModal({ type: "locationView", locationName }),
    []
  );
  const closeModal = useCallback(() => setModal({ type: "none" }), []);

  // ── SCAN MODE ────────────────────────────────────────────────────────

  const toggleScanMode = useCallback(() => {
    const turningOn = scanContextRef.current !== "scanMode";
    setActiveScanContext(turningOn ? "scanMode" : null);
    toast(turningOn ? "Scan mode ON — pull trigger to scan" : "Scan mode off", "info");
  }, [setActiveScanContext, toast]);

  // ── LOCATION CHECK ───────────────────────────────────────────────────

  const pickLocationForCheck = useCallback(
    (name: string) => {
      setCheckLocationName(name);
      setLiveCheckEpcs(new Set());
      liveCheckEpcsRef.current = new Set();
      setActiveScanContext("check");
      closeModal();
    },
    [closeModal, setActiveScanContext]
  );

  const checkData = useMemo<CheckData | null>(() => {
    if (!checkLocationName) return null;
    const locationAssets = assets.filter((a) => a.name && a.location === checkLocationName);
    const found = locationAssets.filter((a) => liveCheckEpcs.has(a.epc));
    const missing = locationAssets.filter((a) => !liveCheckEpcs.has(a.epc));
    const unexpectedEpcs = [...liveCheckEpcs].filter((epc) => !locationAssets.some((a) => a.epc === epc));
    const unexpected: UnexpectedItem[] = unexpectedEpcs.map((epc) => {
      const elsewhere = assets.find((a) => a.epc === epc && a.name);
      return elsewhere
        ? {
            name: elsewhere.name,
            serial: getSerial(elsewhere),
            note: `Registered at ${elsewhere.location || "no location"} — not here`,
          }
        : {
            name: "Unregistered tag",
            serial: "",
            note: "Not registered anywhere — added to Needs Action",
          };
    });
    return {
      locationName: checkLocationName,
      scannedEpcs: [...liveCheckEpcs],
      found,
      missing,
      unexpected,
      time: new Date(),
    };
  }, [assets, checkLocationName, liveCheckEpcs]);

  // ── CHECK OUT / CHECK IN / FIND ──────────────────────────────────────

  const goToInoutState = useCallback(
    (s: InoutState) => {
      if (s === "menu") resetHunt();
      setInoutState(s);
    },
    [resetHunt]
  );

  const beginCheckout = useCallback(
    (destination: string) => {
      const dest = destination.trim();
      if (!dest) {
        toast("Enter a destination first", "error");
        return;
      }
      setCheckoutDestination(dest);
      checkoutDestinationRef.current = dest;
      setCheckoutSessionItems([]);
      setActiveScanContext("checkout");
      setInoutState("checkoutLive");
    },
    [setActiveScanContext, toast]
  );

  const beginCheckin = useCallback(
    (location: string) => {
      if (!location) {
        toast("Pick a location first", "error");
        return;
      }
      setCheckinReturnLocation(location);
      checkinReturnLocationRef.current = location;
      setCheckinSessionItems([]);
      setActiveScanContext("checkin");
      setInoutState("checkinLive");
    },
    [setActiveScanContext, toast]
  );

  const huntToggleSelect = useCallback((id: string) => {
    setHuntSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const huntSelectAllMatches = useCallback((ids: string[]) => {
    setHuntSelectedIds((prev) => new Set([...prev, ...ids]));
  }, []);

  const beginHunt = useCallback(() => {
    const targets = [...huntSelectedIds]
      .map((id) => assetsRef.current.find((a) => a.id === id))
      .filter((a): a is Asset => Boolean(a && a.epc));
    if (!targets.length) {
      toast("Select at least one item first", "error");
      return;
    }
    const mapped = targets.map((a) => ({
      id: a.id,
      epc: a.epc,
      name: a.name,
      serial: getSerial(a),
      location: a.location || "",
    }));
    setHuntTargets(mapped);
    huntTargetsRef.current = mapped;
    setHuntFoundEpcs(new Set());
    huntFoundEpcsRef.current = new Set();
    setActiveScanContext("hunt");
    setInoutState("huntLive");
  }, [huntSelectedIds, setActiveScanContext, toast]);

  const stopInoutSession = useCallback(() => {
    setActiveScanContext(null);
    resetHunt();
    setInoutState("menu");
    setScanHubState("menu");
    setTab("scan");
  }, [resetHunt, setActiveScanContext]);

  // ── IMPORT REVIEW BANNER ─────────────────────────────────────────────

  const dismissImportBanner = useCallback(() => setImportReviewCount(null), []);

  /** Jumps straight to the freshly-imported untagged gear. */
  const reviewImportedAssets = useCallback(() => {
    setStatusFilter("Untagged");
    setSearch("");
    setLocationFilter("");
    setImportReviewCount(null);
  }, []);

  // ── ACTIONS ──────────────────────────────────────────────────────────

  const saveAsset = useCallback(
    async (id: string | null, data: Partial<Asset>) => {
      try {
        if (id) {
          await updateDoc(doc(db, "assets", id), { ...data, updatedAt: new Date().toISOString() });
          toast("Saved ✓", "success");
        } else {
          const rtId = formatRigTrakId(await reserveRigTrakIds(1));
          await addDoc(assetsCol, {
            ...data,
            epc: "",
            rigtrakId: rtId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          toast("Asset added ✓ — untagged, link a tag when ready", "success");
        }
        setModal({ type: "none" });
      } catch (e) {
        toast("Save failed: " + (e as Error).message, "error");
      }
    },
    [toast]
  );

  const deleteAsset = useCallback(
    async (id: string) => {
      const asset = assetsRef.current.find((a) => a.id === id);
      if (!asset) return;
      const { id: _omit, ...assetData } = asset;
      try {
        await deleteDoc(doc(db, "assets", id));
        setModal({ type: "none" });
        toast(`${asset.name || "Item"} deleted`, "success", {
          label: "Undo",
          onClick: async () => {
            try {
              await setDoc(doc(db, "assets", id), assetData);
              toast("Restored ✓", "success");
            } catch (e) {
              toast("Could not undo: " + (e as Error).message, "error");
            }
          },
        });
      } catch (e) {
        toast("Delete failed: " + (e as Error).message, "error");
      }
    },
    [toast]
  );

  const resolveQuarantine = useCallback(
    async (id: string, newStatus: string) => {
      try {
        await updateDoc(doc(db, "assets", id), { status: newStatus, updatedAt: new Date().toISOString() });
        toast(newStatus === "Active" ? "Returned to service ✓" : "Marked as condemned", "success");
        setModal({ type: "none" });
      } catch (e) {
        toast("Update failed: " + (e as Error).message, "error");
      }
    },
    [toast]
  );

  const confirmMatch = useCallback(
    async (stubId: string, targetId: string) => {
      const stub = assetsRef.current.find((a) => a.id === stubId);
      if (!stub) return;
      try {
        await updateDoc(doc(db, "assets", targetId), { epc: stub.epc, updatedAt: new Date().toISOString() });
        await deleteDoc(doc(db, "assets", stubId));
        toast("Tag linked to register item ✓", "success");
        setModal({ type: "none" });
      } catch (e) {
        toast("Match failed: " + (e as Error).message, "error");
      }
    },
    [toast]
  );

  const bulkSetLocation = useCallback(
    async (location: string) => {
      if (!selectedIds.size) return;
      if (!location) {
        toast("Pick a location first", "error");
        return;
      }
      if (!confirm(`Move ${selectedIds.size} asset(s) to "${location}"?`)) return;
      const batch = writeBatch(db);
      selectedIds.forEach((id) =>
        batch.update(doc(db, "assets", id), { location, updatedAt: new Date().toISOString() })
      );
      try {
        await batch.commit();
        toast(`${selectedIds.size} assets moved to ${location} ✓`, "success");
        clearSelection();
      } catch (e) {
        toast("Update failed: " + (e as Error).message, "error");
      }
    },
    [clearSelection, selectedIds, toast]
  );

  const bulkSetStatus = useCallback(
    async (status: string) => {
      if (!selectedIds.size) return;
      if (!confirm(`Set ${selectedIds.size} asset(s) to "${status}"?`)) return;
      const batch = writeBatch(db);
      selectedIds.forEach((id) =>
        batch.update(doc(db, "assets", id), { status, updatedAt: new Date().toISOString() })
      );
      try {
        await batch.commit();
        toast(`${selectedIds.size} assets updated to ${status} ✓`, "success");
        clearSelection();
      } catch (e) {
        toast("Update failed: " + (e as Error).message, "error");
      }
    },
    [clearSelection, selectedIds, toast]
  );

  const bulkDelete = useCallback(async () => {
    if (!selectedIds.size) return;
    const idsToDelete = [...selectedIds];
    const deletedAssets = idsToDelete
      .map((id) => assetsRef.current.find((a) => a.id === id))
      .filter((a): a is Asset => Boolean(a));
    const batch = writeBatch(db);
    idsToDelete.forEach((id) => batch.delete(doc(db, "assets", id)));
    try {
      await batch.commit();
      toast(`${deletedAssets.length} asset(s) deleted`, "success", {
        label: "Undo",
        onClick: async () => {
          try {
            const restoreBatch = writeBatch(db);
            deletedAssets.forEach((a) => {
              const { id, ...data } = a;
              restoreBatch.set(doc(db, "assets", id), data);
            });
            await restoreBatch.commit();
            toast(`${deletedAssets.length} asset(s) restored ✓`, "success");
          } catch (e) {
            toast("Could not undo: " + (e as Error).message, "error");
          }
        },
      });
      clearSelection();
    } catch (e) {
      toast("Delete failed: " + (e as Error).message, "error");
    }
  }, [clearSelection, selectedIds, toast]);

  const addLocation = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (locationsRef.current.find((l) => l.name.toLowerCase() === trimmed.toLowerCase())) {
        toast("Location already exists", "error");
        return;
      }
      await addDoc(locationsCol, { name: trimmed, createdAt: new Date().toISOString() });
      toast(`${trimmed} added ✓`, "success");
    },
    [toast]
  );

  /**
   * Adds a location without leaving the asset edit screen. Returns the name to
   * select in the dropdown, or null if nothing was added.
   */
  const addLocationInline = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return null;
      const existing = locationsRef.current.find(
        (l) => l.name.trim().toLowerCase() === trimmed.toLowerCase()
      );
      if (existing) {
        // Already exists — just select it rather than erroring.
        toast(`Selected existing location "${existing.name}"`, "info");
        return existing.name;
      }
      await addDoc(locationsCol, { name: trimmed, createdAt: new Date().toISOString() });
      toast(`${trimmed} added & selected ✓`, "success");
      return trimmed;
    },
    [toast]
  );

  const deleteLocation = useCallback(
    async (id: string, name: string) => {
      const count = assetsRef.current.filter((a) => a.location === name).length;
      if (!confirm(count > 0 ? `"${name}" has ${count} asset(s). Delete anyway?` : `Delete "${name}"?`)) return;
      await deleteDoc(doc(db, "locations", id));
      toast("Location deleted", "success");
    },
    [toast]
  );

  /**
   * Merges duplicate locations (same name, ignoring case/spacing) down to one.
   * Assets keep working because they reference locations by name, not by record.
   */
  const cleanUpDuplicateLocations = useCallback(async () => {
    const byName = new Map<string, Location[]>();
    locationsRef.current.forEach((l) => {
      const key = l.name.trim().toLowerCase();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key)!.push(l);
    });
    const dupes = [...byName.values()].filter((group) => group.length > 1);
    if (!dupes.length) {
      toast("No duplicate locations found", "info");
      return;
    }
    const toDelete = dupes.flatMap((group) => group.slice(1)); // keep the first of each
    if (!confirm(`Merge ${toDelete.length} duplicate location record(s)? Your assets won't be affected.`)) return;
    const batch = writeBatch(db);
    toDelete.forEach((l) => batch.delete(doc(db, "locations", l.id)));
    await batch.commit();
    toast(`${toDelete.length} duplicate location(s) merged ✓`, "success");
  }, [toast]);

  const addInspector = useCallback(
    async (data: Omit<Inspector, "id" | "createdAt">) => {
      const name = data.name.trim();
      if (!name) {
        toast("Inspector name is required", "error");
        return;
      }
      if (inspectors.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
        toast("That inspector already exists", "error");
        return;
      }
      await addDoc(inspectorsCol, { ...data, name, createdAt: new Date().toISOString() });
      toast(`${name} added as an inspector ✓`, "success");
    },
    [inspectors, toast]
  );

  const deleteInspector = useCallback(
    async (id: string, name: string) => {
      const insp = inspectors.find((i) => i.id === id);
      if (!insp) return;
      const { id: _omit, ...data } = insp;
      await deleteDoc(doc(db, "inspectors", id));
      toast(`${name} removed`, "success", {
        label: "Undo",
        onClick: async () => {
          try {
            await setDoc(doc(db, "inspectors", id), data);
            toast("Restored ✓", "success");
          } catch (e) {
            toast("Could not undo: " + (e as Error).message, "error");
          }
        },
      });
    },
    [inspectors, toast]
  );

  const saveCompanyProfile = useCallback(
    async (data: CompanyProfile) => {
      try {
        await setDoc(companyDocRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
        toast("Company profile saved ✓", "success");
      } catch (e) {
        toast("Save failed: " + (e as Error).message, "error");
      }
    },
    [toast]
  );

  /** Register import: bulk-writes untagged assets, then auto-creates any new locations. */
  const importRegisterRows = useCallback(
    async (rows: RegisterRow[]) => {
      if (!rows.length) return;
      try {
        const startId = await reserveRigTrakIds(rows.length);
        const now = new Date().toISOString();
        let idx = 0;
        for (let i = 0; i < rows.length; i += 400) {
          const chunk = rows.slice(i, i + 400);
          const batch = writeBatch(db);
          chunk.forEach((row) => {
            const rtId = formatRigTrakId(startId + idx);
            idx++;
            const descBits = [
              row.category,
              row.capacity ? row.capacity + (row.capacityUnit ? " " + row.capacityUnit : "") : "",
              row.lengthM ? row.lengthM + "m" : "",
              row.manufacturer,
            ]
              .filter(Boolean)
              .join(" · ");
            const lastInsp = parseDateLoose(row.lastInspection);
            const nextDue = parseDateLoose(row.nextInspection);
            // Imported registers carry one date pair — bring it in as a Quarterly
            // schedule (the standard lifting-gear cycle); editable per item after.
            const schedules =
              lastInsp || nextDue ? [{ type: "Quarterly", lastInspected: lastInsp, nextDue }] : [];
            const derived = deriveComplianceFields(schedules, null);
            batch.set(doc(assetsCol), {
              rigtrakId: rtId,
              epc: "",
              name: row.description,
              serialNumber: row.serialNumber,
              location: row.location || "",
              description: descBits || row.notes || "",
              status: mapAssetStatus(row.status),
              schedules,
              retirementDate: null,
              complianceDate: derived.complianceDate,
              lastChecked: derived.lastChecked,
              inspector: "",
              assetCategory: row.category,
              wllValue: row.capacity,
              wllUnit: row.capacityUnit,
              lengthM: row.lengthM,
              manufacturer: row.manufacturer,
              sourceRegister: row.sourceRegister,
              needsReview: row.needsReview,
              createdAt: now,
              updatedAt: now,
            });
          });
          await batch.commit();
        }

        // Auto-create any locations the register referenced that don't exist yet,
        // so imported gear lands under real, selectable locations (matched
        // case-insensitively so "Unit 01" and "unit 01" don't both get created).
        const existingLocNames = new Set(locationsRef.current.map((l) => l.name.trim().toLowerCase()));
        const newLocNames = [
          ...new Set(
            rows
              .map((r) => (r.location || "").trim())
              .filter(Boolean)
              .filter((loc) => !existingLocNames.has(loc.toLowerCase()))
          ),
        ];
        if (newLocNames.length) {
          const locBatch = writeBatch(db);
          newLocNames.forEach((name) =>
            locBatch.set(doc(locationsCol), { name, createdAt: new Date().toISOString() })
          );
          await locBatch.commit();
        }

        setModal({ type: "none" });
        toast(
          `${rows.length} items imported${
            newLocNames.length ? ` · ${newLocNames.length} new location(s) created` : ""
          } ✓`,
          "success"
        );
        // Send the user straight to the freshly-imported untagged gear.
        setTab("assets");
        setImportReviewCount(rows.length);
      } catch (e) {
        toast("Import failed: " + (e as Error).message, "error");
      }
    },
    [toast]
  );

  const value = useMemo<StoreValue>(
    () => ({
      assets,
      locations,
      inspectors,
      checkouts,
      company,
      loading,
      tab,
      switchTab,
      scanHubState,
      switchScanView,
      backToScanMenu,
      search,
      setSearch,
      statusFilter,
      setStatusFilter,
      locationFilter,
      setLocationFilter,
      sort,
      setSort,
      filterByStatus,
      filterDueSoon,
      alertJumpTo,
      selectedIds,
      toggleSelect,
      clearSelection,
      toggleSelectAll,
      modal,
      openAdd,
      openEdit,
      openView,
      openImport,
      openSettings,
      openMatch,
      openLocationPick,
      openLocationView,
      closeModal,
      scanContext,
      toggleScanMode,
      checkLocationName,
      liveCheckEpcs,
      checkData,
      pickLocationForCheck,
      stopLiveCheck,
      inoutState,
      goToInoutState,
      checkoutDestination,
      checkoutSessionItems,
      checkinReturnLocation,
      checkinSessionItems,
      beginCheckout,
      beginCheckin,
      huntTargets,
      huntFoundEpcs,
      huntSelectedIds,
      huntToggleSelect,
      huntSelectAllMatches,
      beginHunt,
      stopInoutSession,
      importReviewCount,
      dismissImportBanner,
      reviewImportedAssets,
      toasts,
      toast,
      dismissToast,
      saveAsset,
      deleteAsset,
      resolveQuarantine,
      confirmMatch,
      bulkSetLocation,
      bulkSetStatus,
      bulkDelete,
      addLocation,
      addLocationInline,
      deleteLocation,
      cleanUpDuplicateLocations,
      addInspector,
      deleteInspector,
      saveCompanyProfile,
      importRegisterRows,
    }),
    [
      assets,
      locations,
      inspectors,
      checkouts,
      company,
      loading,
      tab,
      switchTab,
      scanHubState,
      switchScanView,
      backToScanMenu,
      search,
      statusFilter,
      locationFilter,
      sort,
      filterByStatus,
      filterDueSoon,
      alertJumpTo,
      selectedIds,
      toggleSelect,
      clearSelection,
      toggleSelectAll,
      modal,
      openAdd,
      openEdit,
      openView,
      openImport,
      openSettings,
      openMatch,
      openLocationPick,
      openLocationView,
      closeModal,
      scanContext,
      toggleScanMode,
      checkLocationName,
      liveCheckEpcs,
      checkData,
      pickLocationForCheck,
      stopLiveCheck,
      inoutState,
      goToInoutState,
      checkoutDestination,
      checkoutSessionItems,
      checkinReturnLocation,
      checkinSessionItems,
      beginCheckout,
      beginCheckin,
      huntTargets,
      huntFoundEpcs,
      huntSelectedIds,
      huntToggleSelect,
      huntSelectAllMatches,
      beginHunt,
      stopInoutSession,
      importReviewCount,
      dismissImportBanner,
      reviewImportedAssets,
      toasts,
      toast,
      dismissToast,
      saveAsset,
      deleteAsset,
      resolveQuarantine,
      confirmMatch,
      bulkSetLocation,
      bulkSetStatus,
      bulkDelete,
      addLocation,
      addLocationInline,
      deleteLocation,
      cleanUpDuplicateLocations,
      addInspector,
      deleteInspector,
      saveCompanyProfile,
      importRegisterRows,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export { StoreContext };
