import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTodayAgenda } from '@/features/agenda/useTodayAgenda';
import { formatAppointmentTime } from '@/lib/datetime';
import { formatMoneyBRL, todayLongLabel } from '@/lib/format';
import { colors } from '@/lib/theme';

const statusLabel: Record<string, string> = {
  scheduled: 'Agendado',
  pending: 'Pendente',
  confirmed: 'Confirmado',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Falta',
};

const statusColor: Record<string, string> = {
  scheduled: colors.warn,
  pending: colors.warn,
  confirmed: colors.ok,
  completed: colors.inkMuted,
  cancelled: colors.danger,
  no_show: colors.danger,
};

export default function AgendaScreen() {
  const { appointments, isLoading, error, reload } = useTodayAgenda();

  const confirmed = appointments.filter((a) => a.status === 'confirmed').length;
  const revenue = appointments.reduce((sum, apt) => sum + apt.totalPrice.amountInCents, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void reload()} />}
    >
      <Text style={styles.date}>{todayLongLabel()}</Text>
      <Text style={styles.title}>Agenda de hoje</Text>
      <Text style={styles.subtitle}>Atendimentos do dia, em ordem de horário.</Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{confirmed}</Text>
          <Text style={styles.statLabel}>Confirmados</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { fontSize: 15 }]}>{formatMoneyBRL(revenue)}</Text>
          <Text style={styles.statLabel}>Previsto</Text>
        </View>
      </View>

      {isLoading && appointments.length === 0 ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && appointments.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={28} color={colors.brand} />
          <Text style={styles.emptyTitle}>Agenda livre hoje</Text>
          <Text style={styles.emptyBody}>
            Os atendimentos do Firestore aparecem aqui. Crie no web ou use o seed do cadastro.
          </Text>
        </View>
      ) : null}

      {appointments.map((apt, index) => {
        const serviceName = apt.services.map((s) => s.name).join(', ');
        const color = statusColor[apt.status] ?? colors.inkMuted;
        return (
          <View key={apt.id} style={styles.row}>
            <View style={styles.timeline}>
              <View style={[styles.dot, { backgroundColor: colors.brand }]} />
              {index < appointments.length - 1 ? <View style={styles.line} /> : null}
            </View>
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.time}>{formatAppointmentTime(apt.startAt)}</Text>
                <Text style={[styles.status, { color }]}>
                  {statusLabel[apt.status] ?? apt.status}
                </Text>
              </View>
              <Text style={styles.client}>{apt.clientName}</Text>
              <Text style={styles.service}>{serviceName}</Text>
              <Text style={styles.price}>{formatMoneyBRL(apt.totalPrice.amountInCents)}</Text>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 48 },
  date: { fontSize: 13, color: colors.inkMuted, textTransform: 'capitalize' },
  title: { marginTop: 4, fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { marginTop: 6, fontSize: 14, color: colors.inkMuted, marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16, marginBottom: 8 },
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
  row: { flexDirection: 'row', marginTop: 8 },
  timeline: { width: 18, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 22 },
  line: { flex: 1, width: 2, backgroundColor: colors.paperLine, marginTop: 4 },
  card: {
    flex: 1,
    marginLeft: 8,
    marginBottom: 8,
    padding: 16,
    backgroundColor: colors.paperRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 18, fontWeight: '800', color: colors.brand },
  status: { fontSize: 12, fontWeight: '700' },
  client: { marginTop: 8, fontSize: 16, fontWeight: '700', color: colors.ink },
  service: { marginTop: 4, fontSize: 14, color: colors.inkSoft },
  price: { marginTop: 8, fontSize: 13, fontWeight: '600', color: colors.inkMuted },
});
