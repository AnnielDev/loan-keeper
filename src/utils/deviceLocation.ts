import * as Location from "expo-location";

const POSITION_TIMEOUT_MS = 15_000;

export type DeviceLocation = {
  country?: string;
  timezone?: string;
};

// getCurrentPositionAsync has no built-in timeout and never resolves when
// there's no fix to give (iOS Simulator with no simulated location, weak
// GPS signal indoors, etc.) — race it so the caller gets an error instead
// of hanging forever.
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Location request timed out")), ms);
    }),
  ]);
}

// Checks whether we can currently get a location fix without prompting:
// both app permission and the OS-wide location services toggle must be on.
// Used to re-gate the app if the user grants access once and later revokes
// it (either the app permission or the whole device's location services).
export async function getLocationAccessGranted(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      return false;
    }
    return await Location.hasServicesEnabledAsync();
  } catch {
    return false;
  }
}

export type DeviceLocationResult =
  | { status: "granted"; location: DeviceLocation }
  // canAskAgain is false once the user has explicitly denied on iOS/Android;
  // requesting again won't show the system dialog and they must go to Settings.
  | { status: "denied"; canAskAgain: boolean }
  | { status: "error" };

// Requires the user to grant foreground location permission, then derives
// country from a reverse-geocode of the current position (native OS
// geocoder, no API key needed) and timezone from the device's own Intl
// data. Fully client-side: works the same against a local dev backend and
// a production one, since it never depends on the server seeing a public IP.
export async function requestDeviceLocation(): Promise<DeviceLocationResult> {
  try {
    const { status, canAskAgain } =
      await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      return { status: "denied", canAskAgain };
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
      POSITION_TIMEOUT_MS,
    );
    const [address] = await Location.reverseGeocodeAsync({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    return {
      status: "granted",
      location: {
        country: address?.isoCountryCode ?? undefined,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  } catch {
    return { status: "error" };
  }
}
