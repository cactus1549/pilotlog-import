import { StatusBar } from 'expo-status-bar';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { toPilotlogCsv } from './src/export/csv';
import { MlKitOcrEngine } from './src/ocr/ocrEngine';
import { parseSkywestPairing } from './src/parser/skywest';
import { buildCsvFileName, CSV_MIME_TYPE } from './src/utils/csvFile';

const SAMPLE_TEXT = `OT2 N5908B ER7 - 090245 Sacha Sardoinfirri - DEN ER7 CA
Monday 06-01-2026
UA5464 DEN SFO 09:43 11:25 1:27 1:14
Tuesday 06-02-2026
UA4643 LAX SAN 09:00 10:08 1:08 0:56
Captain: 090245 Sacha Sardoinfirri
First Officer: 121703 Amber Westphal
FA: 046565 Jessica Ortega
FF: 048930 Diana Sanow`;

const ocrEngine = new MlKitOcrEngine();

export default function App() {
  const [rawText, setRawText] = useState(SAMPLE_TEXT);
  const [imageUri, setImageUri] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('Ready.');

  const rows = useMemo(() => parseSkywestPairing(rawText), [rawText]);
  const csv = useMemo(() => toPilotlogCsv(rows), [rows]);

  const pickImageAndRunOcr = useCallback(async () => {
    setBusy(true);
    setStatus('Selecting screenshot...');

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setStatus('Photo permission denied.');
        return;
      }

      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 1,
      });

      if (picked.canceled || picked.assets.length === 0) {
        setStatus('Image selection canceled.');
        return;
      }

      const selected = picked.assets[0].uri;
      setImageUri(selected);
      setStatus('Running OCR...');

      const extracted = await ocrEngine.extractText(selected);
      setRawText(extracted);
      setStatus('OCR complete.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown OCR error';
      setStatus(`OCR failed: ${message}`);
      Alert.alert('OCR failed', message);
    } finally {
      setBusy(false);
    }
  }, []);

  const shareCsv = useCallback(async () => {
    if (!FileSystem.cacheDirectory) {
      Alert.alert('Export failed', 'Cache directory is unavailable on this device.');
      return;
    }

    setBusy(true);
    setStatus('Preparing CSV file...');

    try {
      const fileName = buildCsvFileName();
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        setStatus(`CSV saved locally: ${fileUri}`);
        Alert.alert('Sharing unavailable', `CSV saved locally at:\n${fileUri}`);
        return;
      }

      await Sharing.shareAsync(fileUri, {
        mimeType: CSV_MIME_TYPE,
        dialogTitle: 'Share Pilotlog CSV',
      });

      setStatus(`CSV ready: ${fileName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown export error';
      setStatus(`CSV export failed: ${message}`);
      Alert.alert('CSV export failed', message);
    } finally {
      setBusy(false);
    }
  }, [csv]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pilotlog Import MVP (React Native)</Text>
        <Text style={styles.subtitle}>
          Pick screenshot → OCR → parse flights → export/share Pilotlog CSV.
        </Text>

        <View style={styles.controls}>
          <Pressable disabled={busy} onPress={pickImageAndRunOcr} style={[styles.button, busy && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>Pick image + OCR</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={shareCsv} style={[styles.button, busy && styles.buttonDisabled]}>
            <Text style={styles.buttonText}>Save/Share CSV</Text>
          </Pressable>
          <Pressable disabled={busy} onPress={() => setRawText(SAMPLE_TEXT)} style={[styles.secondaryButton, busy && styles.buttonDisabled]}>
            <Text style={styles.secondaryButtonText}>Load sample text</Text>
          </Pressable>
        </View>

        {busy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator />
            <Text style={styles.status}>{status}</Text>
          </View>
        ) : (
          <Text style={styles.status}>{status}</Text>
        )}

        {imageUri ? <Text style={styles.meta}>Selected image: {imageUri}</Text> : null}
        <Text style={styles.meta}>Parsed segments: {rows.length}</Text>

        <Text style={styles.section}>Raw OCR Text</Text>
        <TextInput
          multiline
          value={rawText}
          onChangeText={setRawText}
          style={styles.input}
          autoCapitalize="characters"
        />

        <Text style={styles.section}>CSV Output</Text>
        <Text selectable style={styles.csvOutput}>
          {csv}
        </Text>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    color: '#334155',
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  section: {
    fontWeight: '600',
    color: '#0f172a',
  },
  input: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    color: '#1e293b',
  },
  meta: {
    color: '#475569',
    fontSize: 12,
  },
  csvOutput: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    padding: 12,
    fontFamily: 'Courier',
  },
});
