export type AssetStatus = "Active" | "Quarantine" | "Condemned" | "Unregistered";

/** The inspection cycles an asset can be on, mapped to their interval in months. */
export const SCHEDULE_TYPES: Record<string, number> = {
  Monthly: 1,
  Quarterly: 3,
  "Six-Monthly": 6,
  Annual: 12,
};

export interface Schedule {
  type: string;
  lastInspected: string | null;
  nextDue: string | null;
}

export interface Asset {
  id: string;
  /** Global sequential identifier, e.g. RT-000147. */
  rigtrakId?: string;
  /** RFID tag. Empty string means the asset is untagged (imported, not yet linked). */
  epc: string;
  name: string;
  /** Primary human identifier. Older records store it as `sourceId` — read via getSerial(). */
  serialNumber?: string;
  sourceId?: string;
  location: string;
  description: string;
  status: AssetStatus | string;

  /** An asset can carry several independent inspection cycles at once. */
  schedules?: Schedule[];
  /** Hard expiry (e.g. 10-year height safety) after which the item must be discarded. */
  retirementDate?: string | null;
  /** Derived: soonest next-due across every schedule and the retirement date. */
  complianceDate: string | null;
  /** Derived: most recent inspection across every schedule. */
  lastChecked?: string | null;

  inspector?: string;
  photo?: string;

  checkedOut?: boolean;
  checkedOutTo?: string | null;

  assetCategory?: string;
  wllValue?: string;
  wllUnit?: string;
  lengthM?: string;
  manufacturer?: string;
  sourceRegister?: string;
  needsReview?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  name: string;
  createdAt: string;
}

export interface Inspector {
  id: string;
  name: string;
  ticketType?: string;
  ticketNumber?: string;
  ticketExpiry?: string | null;
  createdAt: string;
}

export interface Checkout {
  id: string;
  assetId: string;
  epc: string;
  rigtrakId?: string;
  assetName: string;
  destination: string;
  checkedOutAt: string;
  checkedInAt: string | null;
}

export interface CompanyProfile {
  name?: string;
  abn?: string;
  phone?: string;
  address?: string;
  logo?: string;
  updatedAt?: string;
}

export interface Scan {
  epc: string;
  timestamp?: unknown;
}

/** A row parsed out of a customer's register file, before it is imported. */
export interface RegisterRow {
  serialNumber: string;
  description: string;
  category: string;
  capacity: string;
  capacityUnit: string;
  lengthM: string;
  manufacturer: string;
  location: string;
  status: string;
  lastInspection: string;
  nextInspection: string;
  notes: string;
  sourceRegister: string;
  needsReview: string;
}

/** What was physically present at a location at a point in time. */
export interface UnexpectedItem {
  name: string;
  serial: string;
  note: string;
}

export interface CheckData {
  locationName: string;
  scannedEpcs: string[];
  found: Asset[];
  missing: Asset[];
  unexpected: UnexpectedItem[];
  time: Date;
}

export interface SessionItem {
  name: string;
  serial: string;
  time: string;
}

export interface HuntTarget {
  id: string;
  epc: string;
  name: string;
  serial: string;
  location: string;
}

export type SortKey = "name" | "compliance" | "status" | "recent";
export type TabKey = "assets" | "scan" | "locations" | "report";
export type ScanHubState = "menu" | "needsaction" | "check" | "inout";
export type InoutState =
  | "menu"
  | "checkoutPicker"
  | "checkoutLive"
  | "checkinPicker"
  | "checkinLive"
  | "huntPicker"
  | "huntLive";

/**
 * Only one scanning mode can be active at a time, so a single scan can never be
 * picked up by two features at once. Starting any mode stops whichever was running.
 */
export type ScanContext = null | "scanMode" | "check" | "checkout" | "checkin" | "hunt";

export const DEFAULT_LOCATIONS = ["Yard", "Shed", "Container", "Truck 1", "Truck 2"];
