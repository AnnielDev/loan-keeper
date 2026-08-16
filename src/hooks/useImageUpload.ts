import * as ImagePicker from "expo-image-picker";
import { useCallback, useState } from "react";

import { uploadImage } from "@/services/uploads";

export type ImageSource = "camera" | "library";

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);

  const pickAndUpload = useCallback(async (source: ImageSource): Promise<string | null> => {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return null;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] })
        : await ImagePicker.launchImageLibraryAsync({
            quality: 0.7,
            mediaTypes: ["images"],
          });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    const asset = result.assets[0];
    setIsUploading(true);
    try {
      const { data } = await uploadImage(
        asset.uri,
        asset.fileName ?? `photo-${Date.now()}.jpg`,
        asset.mimeType ?? "image/jpeg",
      );
      return data.url;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { pickAndUpload, isUploading };
}
