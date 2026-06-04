import * as DocumentPicker from 'expo-document-picker';
// expo-file-system 19 moved the legacy URI/encoding API behind /legacy
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { FilesystemService } from './types';

export const filesystemService: FilesystemService = {
  async pickFile() {
    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (res.canceled) return null;
    const asset = res.assets[0];
    if (!asset) return null;
    const base64 = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { uri: asset.uri, name: asset.name, base64 };
  },
  async saveFile({ suggestedName, base64, mimeType = 'application/octet-stream' }) {
    const tmpUri = `${FileSystem.cacheDirectory}${suggestedName}`;
    await FileSystem.writeAsStringAsync(tmpUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const info = await FileSystem.getInfoAsync(tmpUri);
    if (!info.exists) return null;
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(tmpUri, { mimeType, dialogTitle: 'Save backup' });
    }
    return { uri: tmpUri, sizeBytes: info.size ?? 0 };
  },
  async share(uri: string, mimeType?: string) {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, mimeType ? { mimeType } : undefined);
    }
  },
};
