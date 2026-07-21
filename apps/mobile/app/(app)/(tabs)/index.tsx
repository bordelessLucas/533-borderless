import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import { useDailyChecklist } from '@/features/checklist/useDailyChecklist';
import { useTodayAgenda } from '@/features/agenda/useTodayAgenda';
import { openWhatsApp, todayLongLabel } from '@/lib/format';
import { colors } from '@/lib/theme';

const kindLabel: Record<string, string> = {
  reminder: 'Lembrete',
  confirmation: 'Confirmação',
  recurrence_return: 'Retorno',
};

export default function TodayScreen() {
  const { signOut } = useAuth();
  const { workspace } = useWorkspace();
  const { summary, isLoading, error, reload, toggleDone } = useDailyChecklist();
  const { appointments, reload: reloadAgenda } = useTodayAgenda();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const items = summary?.items ?? [];
  const pending = items.filter((item) => !item.done).length;
  const done = items.length - pending;
  const todayAppointments = appointments.length;

  async function refreshAll() {
    await Promise.all([reload(), reloadAgenda()]);
  }

  async function copyMessage(appointmentId: string, message: string) {
    await Clipboard.setStringAsync(message);
    setCopiedId(appointmentId);
    setTimeout(() => setCopiedId(null), 1800);
  }

  async function sendWhatsApp(appointmentId: string, phone: string, message: string) {
    setBusyId(appointmentId);
    try {
      await Clipboard.setStringAsync(message);
      await openWhatsApp(phone, message);
    } catch {
      Alert.alert('WhatsApp', 'Não foi possível abrir o WhatsApp. A mensagem já foi copiada.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => void refreshAll()} />
      }
    >
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>Sócio247</Text>
          <Text style={styles.kicker}>{workspace?.name ?? 'Seu negócio'}</Text>
        </View>
        <Pressable
          onPress={() =>
            Alert.alert('Sair', 'Deseja sair da conta?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => void signOut() },
            ])
          }
          style={styles.signOutBtn}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.inkMuted} />
        </Pressable>
      </View>

      <Text style={styles.date}>{todayLongLabel()}</Text>
      <Text style={styles.title}>Resumo das 08:00</Text>
      <Text style={styles.subtitle}>
        Modo assistido: envie no WhatsApp e marque o que já avisou.
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{todayAppointments}</Text>
          <Text style={styles.statLabel}>Agenda hoje</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{pending}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{done}</Text>
          <Text style={styles.statLabel}>Avisados</Text>
        </View>
      </View>

      {isLoading && !summary ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={28} color={colors.brand} />
          <Text style={styles.emptyTitle}>Nada para avisar agora</Text>
          <Text style={styles.emptyBody}>
            Quando o resumo do dia for gerado (seed no cadastro ou job das 08:00), as mensagens
            prontas aparecem aqui para copiar/enviar.
          </Text>
        </View>
      ) : null}

      {items.map((item) => (
        <View key={item.appointmentId} style={[styles.card, item.done && styles.cardDone]}>
          <View style={styles.cardHeader}>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <Text style={[styles.badge, item.done ? styles.badgeOk : styles.badgeWarn]}>
              {item.done ? 'Avisado' : 'Pendente'}
            </Text>
          </View>
          <Text style={styles.kind}>{kindLabel[item.kind] ?? item.kind}</Text>
          <Text style={styles.phone}>{item.clientPhone}</Text>
          <Text style={styles.message}>{item.message}</Text>

          <View style={styles.actions}>
            <Pressable
              style={styles.whatsBtn}
              disabled={busyId === item.appointmentId}
              onPress={() =>
                void sendWhatsApp(item.appointmentId, item.clientPhone, item.message)
              }
            >
              <Ionicons name="logo-whatsapp" size={16} color="#fff" />
              <Text style={styles.whatsBtnText}>WhatsApp</Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void copyMessage(item.appointmentId, item.message)}
            >
              <Text style={styles.secondaryBtnText}>
                {copiedId === item.appointmentId ? 'Copiado' : 'Copiar'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.secondaryBtn}
              onPress={() => void toggleDone(item.appointmentId, !item.done)}
            >
              <Text style={styles.secondaryBtnText}>{item.done ? 'Desfazer' : 'Marcar'}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 48 },
  topBar: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  brand: { fontSize: 13, fontWeight: '800', color: colors.brand, letterSpacing: 0.3 },
  kicker: { marginTop: 2, fontSize: 15, fontWeight: '600', color: colors.ink },
  signOutBtn: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.paperLine,
    backgroundColor: colors.paperRaised,
  },
  date: { fontSize: 13, color: colors.inkMuted, textTransform: 'capitalize' },
  title: { marginTop: 4, fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { marginTop: 6, fontSize: 14, color: colors.inkMuted, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  stat: {
    flex: 1,
    backgroundColor: colors.paperRaised,
    borderWidth: 1,
    borderColor: colors.paperLine,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.brand },
  statLabel: { marginTop: 2, fontSize: 11, fontWeight: '600', color: colors.inkMuted },
  error: { color: colors.danger, marginTop: 12 },
  empty: {
    marginTop: 28,
    padding: 20,
    backgroundColor: colors.paperRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.paperLine,
    gap: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.ink },
  emptyBody: { fontSize: 14, color: colors.inkMuted, lineHeight: 20 },
  card: {
    marginTop: 14,
    padding: 16,
    backgroundColor: colors.paperRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  cardDone: { opacity: 0.72 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  clientName: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.ink },
  kind: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
    textTransform: 'uppercase',
  },
  badge: { fontSize: 11, fontWeight: '700' },
  badgeOk: { color: colors.ok },
  badgeWarn: { color: colors.warn },
  phone: { marginTop: 4, fontSize: 12, color: colors.inkMuted },
  message: { marginTop: 10, fontSize: 14, color: colors.inkSoft, lineHeight: 20 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  whatsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#128C7E',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  whatsBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.paperLine,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.paperRaised,
  },
  secondaryBtnText: { color: colors.inkSoft, fontWeight: '700', fontSize: 14 },
});
