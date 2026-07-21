import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInboxNotifications } from '@/features/push/useInboxNotifications';
import { colors } from '@/lib/theme';

const typeMeta: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  daily_summary: { label: 'Resumo do dia', icon: 'sunny-outline' },
  appointment_reminder: { label: 'Lembrete', icon: 'alarm-outline' },
  billing_past_due: { label: 'Assinatura atrasada', icon: 'card-outline' },
  billing_pending: { label: 'Assinatura pendente', icon: 'card-outline' },
  system: { label: 'Sistema', icon: 'information-circle-outline' },
};

export default function AvisosScreen() {
  const { items, isLoading, error, reload, markRead } = useInboxNotifications();
  const unread = items.filter((item) => !item.readAt).length;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => void reload()} />}
    >
      <Text style={styles.title}>Avisos</Text>
      <Text style={styles.subtitle}>
        Resumo diário, lembretes operacionais e cobrança da assinatura.
      </Text>

      <View style={styles.badgeRow}>
        <Text style={styles.badgeText}>
          {unread > 0 ? `${unread} não lido${unread > 1 ? 's' : ''}` : 'Tudo em dia'}
        </Text>
      </View>

      {isLoading && items.length === 0 ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!isLoading && items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="notifications-outline" size={28} color={colors.brand} />
          <Text style={styles.emptyTitle}>Nenhum aviso por enquanto</Text>
          <Text style={styles.emptyBody}>
            Quando o backend enviar push (resumo 08:00, lembretes, billing), eles aparecem aqui.
            No Expo Go o push remoto fica limitado — use um development build depois.
          </Text>
        </View>
      ) : null}

      {items.map((item) => {
        const isUnread = !item.readAt;
        const meta = typeMeta[item.type] ?? typeMeta.system!;
        return (
          <Pressable
            key={item.id}
            style={[styles.card, isUnread && styles.cardUnread]}
            onPress={() => {
              if (isUnread) void markRead(item.id);
            }}
          >
            <View style={styles.cardHeader}>
              <Ionicons name={meta.icon} size={18} color={colors.brand} />
              <Text style={styles.type}>{meta.label}</Text>
              {isUnread ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            {isUnread ? (
              <Text style={styles.unread}>Toque para marcar como lido</Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.paper },
  content: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: colors.ink },
  subtitle: { marginTop: 6, fontSize: 14, color: colors.inkMuted },
  badgeRow: { marginTop: 14, marginBottom: 4 },
  badgeText: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: colors.brand,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
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
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.paperRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.paperLine,
  },
  cardUnread: { borderColor: colors.brand },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  type: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: colors.brand,
    textTransform: 'uppercase',
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warn },
  cardTitle: { marginTop: 8, fontSize: 16, fontWeight: '700', color: colors.ink },
  body: { marginTop: 6, fontSize: 14, color: colors.inkSoft, lineHeight: 20 },
  unread: { marginTop: 10, fontSize: 12, fontWeight: '600', color: colors.warn },
});
