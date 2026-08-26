import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library/legacy";
import { useCallback, useState } from "react";

export function useImageDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadImage = useCallback(async (url: string): Promise<boolean> => {
    setIsDownloading(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return false;
      }

      const filename = url.split("/").pop() || `image-${Date.now()}.jpg`;
      const destination = `${FileSystem.cacheDirectory}${filename}`;
      const { uri } = await FileSystem.downloadAsync(url, destination);
      await MediaLibrary.saveToLibraryAsync(uri);
      await FileSystem.deleteAsync(uri, { idempotent: true });
      return true;
    } catch {
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return { downloadImage, isDownloading };
}
