import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { toPilotlogCsv } from './src/export/csv';
import { parseSkywestPairing } from './src/parser/skywest';

const SAMPLE_TEXT = `OT2 N5908B ER7 - 090245 Sacha Sardoinfirri - DEN ER7 CA
Monday 06-01-2026
UA5464 DEN SFO 09:43 11:25 1:27 1:14
Tuesday 06-02-2026
UA4643 LAX SAN 09:00 10:08 1:08 0:56
Captain: 090245 Sacha Sardoinfirri
First Officer: 121703 Amber Westphal
FA: 046565 Jessica Ortega
FF: 048930 Diana Sanow`;

export default function App() {
  const [rawText, setRawText] = useState(SAMPLE_TEXT);

  const rows = useMemo(() => parseSkywestPairing(rawText), [rawText]);
  const csv = useMemo(() => toPilotlogCsv(rows), [rows]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Pilotlog Import MVP (React Native)</Text>
        <Text style={styles.subtitle}>
          Paste OCR output, review parsed flights, copy CSV into your Pilotlog import flow.
        </Text>

        <Text style={styles.section}>Raw OCR Text</Text>
        <TextInput
          multiline
          value={rawText}
          onChangeText={setRawText}
          style={styles.input}
          autoCapitalize="characters"
        />

        <View style={styles.row}>
          <Text style={styles.section}>Parsed Segments: {rows.length}</Text>
          <Pressable onPress={() => setRawText(SAMPLE_TEXT)} style={styles.button}>
            <Text style={styles.buttonText}>Load sample</Text>
          </Pressable>
        </View>

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1d4ed8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
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
