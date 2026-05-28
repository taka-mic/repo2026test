export interface GpsCoords {
  latitude: number;
  longitude: number;
}

export async function extractGpsFromFile(file: File): Promise<GpsCoords | null> {
  try {
    const exifr = await import("exifr");
    const gps = await exifr.gps(file);
    if (!gps?.latitude || !gps?.longitude) return null;
    return { latitude: gps.latitude, longitude: gps.longitude };
  } catch {
    return null;
  }
}
