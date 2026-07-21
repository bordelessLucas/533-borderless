import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Redirect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/providers/AuthProvider';
import { colors } from '@/lib/theme';

type Mode = 'login' | 'signup';

function formatAuthError(err: unknown): string {
  if (!(err instanceof Error)) {
    return 'Não foi possível entrar. Tente novamente.';
  }

  const code =
    err && typeof err === 'object' && 'code' in err ? String((err as { code: string }).code) : '';
  const message = err.message;

  if (
    code === 'permission-denied' ||
    message.includes('insufficient permissions') ||
    message.includes('Sem permissão para criar o workspace')
  ) {
    return 'Falha ao criar seus dados no Firestore. Confirme o deploy das Security Rules.';
  }

  if (code === 'auth/email-already-in-use') {
    return 'Este e-mail já está cadastrado. Use Entrar ou outro e-mail.';
  }

  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return 'E-mail ou senha inválidos.';
  }

  if (code === 'auth/weak-password') {
    return 'A senha precisa ter pelo menos 6 caracteres.';
  }

  return message || 'Não foi possível entrar. Tente novamente.';
}

export default function LoginScreen() {
  const { signIn, signUp, user, isLoading } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isLoading && user && !isSubmitting) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password);
      } else {
        await signUp({
          email: email.trim(),
          password,
          businessName: businessName.trim(),
          ownerName: ownerName.trim(),
        });
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 6 &&
    (mode === 'login' || (businessName.trim().length > 0 && ownerName.trim().length > 0));

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>Sócio247</Text>
          <Text style={styles.subtitle}>
            {mode === 'login'
              ? 'Entre para ver o resumo do dia e a agenda.'
              : 'Crie sua conta de profissional.'}
          </Text>

          {mode === 'signup' ? (
            <>
              <Text style={styles.label}>Nome do negócio</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Barbearia Norte"
                placeholderTextColor={colors.inkMuted}
                autoCapitalize="words"
              />
              <Text style={styles.label}>Seu nome</Text>
              <TextInput
                style={styles.input}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="João"
                placeholderTextColor={colors.inkMuted}
                autoCapitalize="words"
              />
            </>
          ) : null}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="voce@email.com"
            placeholderTextColor={colors.inkMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.inkMuted}
            secureTextEntry
            autoComplete={mode === 'login' ? 'password' : 'new-password'}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, (!canSubmit || isSubmitting) && styles.buttonDisabled]}
            disabled={!canSubmit || isSubmitting}
            onPress={() => void handleSubmit()}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode((prev) => (prev === 'login' ? 'signup' : 'login'));
              setError(null);
            }}
            style={styles.switchMode}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entrar'}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.paper },
  scroll: { padding: 24, paddingTop: 48 },
  brand: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.brand,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 28,
    fontSize: 16,
    color: colors.inkMuted,
    lineHeight: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.inkSoft,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.paperLine,
    backgroundColor: colors.paperRaised,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink,
    marginBottom: 14,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 14,
  },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  switchMode: { marginTop: 20, alignItems: 'center' },
  switchModeText: { color: colors.brand, fontWeight: '600', fontSize: 15 },
});
