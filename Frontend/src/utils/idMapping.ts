import { shortenUuid } from '@/utils/shortId';

// In-memory cache for mapping between short IDs and UUIDs
const shortToUuidMap = new Map<string, string>();
const uuidToShortMap = new Map<string, string>();

const SHORT_TO_UUID_KEY = 'shortToUuidMap';
const UUID_TO_SHORT_KEY = 'uuidToShortMap';

function saveMapsToStorage() {
  localStorage.setItem(SHORT_TO_UUID_KEY, JSON.stringify(Array.from(shortToUuidMap.entries())));
  localStorage.setItem(UUID_TO_SHORT_KEY, JSON.stringify(Array.from(uuidToShortMap.entries())));
}

function loadMapsFromStorage() {
  shortToUuidMap.clear();
  uuidToShortMap.clear();
  const shortToUuid = localStorage.getItem(SHORT_TO_UUID_KEY);
  const uuidToShort = localStorage.getItem(UUID_TO_SHORT_KEY);
  if (shortToUuid) {
    for (const [short, uuid] of JSON.parse(shortToUuid)) {
      shortToUuidMap.set(short, uuid);
    }
  }
  if (uuidToShort) {
    for (const [uuid, short] of JSON.parse(uuidToShort)) {
      uuidToShortMap.set(uuid, short);
    }
  }
}

// Load maps on module initialization
loadMapsFromStorage();

export function addToIdMap(uuid: string) {
  const shortId = shortenUuid(uuid);
  shortToUuidMap.set(shortId, uuid);
  uuidToShortMap.set(uuid, shortId);
  saveMapsToStorage();
  return shortId;
}

export function getFullUuid(shortId?: string): string | undefined {
  if (!shortId) return undefined;
  loadMapsFromStorage();
  let uuid = shortToUuidMap.get(shortId);
  if (!uuid) {
    // Try to find a uuid that shortens to this shortId
    for (const [candidateShort, candidateUuid] of shortToUuidMap.entries()) {
      if (candidateShort === shortId) {
        uuid = candidateUuid;
        break;
      }
    }
    // If still not found, try to reconstruct from all known UUIDs
    if (!uuid) {
      for (const [candidateUuid] of uuidToShortMap.entries()) {
        if (shortenUuid(candidateUuid) === shortId) {
          uuid = candidateUuid;
          // Optionally, add to map for future fast lookup
          shortToUuidMap.set(shortId, uuid);
          saveMapsToStorage();
          break;
        }
      }
    }
  }
  return uuid;
}

export function getShortId(uuid: string): string {
  let shortId = uuidToShortMap.get(uuid);
  if (!shortId) {
    shortId = addToIdMap(uuid);
  }
  return shortId;
}
