'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getFirebaseClient } from '@/lib/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { useWorkspace } from '@/providers/WorkspaceProvider';
import {
  buildQrCodeImageUrl,
  buildShareMessage,
  getBookingOrigin,
  getDefaultBookingOrigin,
} from './bookingUrl';
import { normalizeSlugInput, parseSlugInput, sanitizeSlugDraft } from './slug';
import {
  getWorkspaceSlug,
  isSlugAvailable,
  updateWorkspaceSlug,
} from './workspace.repository';

export function useMeuLink() {
  const { db } = getFirebaseClient();
  const { user } = useAuth();
  const {
    workspace,
    workspaceId,
    isLoading: isWorkspaceLoading,
    error: workspaceError,
    reload,
  } = useWorkspace();

  const [persistedSlug, setPersistedSlug] = useState(workspace?.slug ?? '');
  const [slugDraft, setSlugDraft] = useState(workspace?.slug ?? '');
  const [bookingOrigin, setBookingOrigin] = useState(getDefaultBookingOrigin);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canEdit = Boolean(workspaceId && user);

  useEffect(() => {
    if (workspace?.slug) {
      setPersistedSlug(workspace.slug);
      setSlugDraft(workspace.slug);
      return;
    }

    if (!workspaceId || isWorkspaceLoading) return;

    let cancelled = false;
    void (async () => {
      try {
        const slug = await getWorkspaceSlug(db, workspaceId);
        if (cancelled || !slug) return;
        setPersistedSlug(slug);
        setSlugDraft(slug);
      } catch {
        // mantém draft atual
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [db, isWorkspaceLoading, workspace?.slug, workspaceId]);

  useEffect(() => {
    setBookingOrigin(getBookingOrigin());
  }, []);

  const configured = Boolean(persistedSlug);
  const bookingLink = useMemo(
    () => (persistedSlug ? `${bookingOrigin}/b/${persistedSlug}` : null),
    [bookingOrigin, persistedSlug],
  );
  const qrCodeUrl = useMemo(
    () => (bookingLink ? buildQrCodeImageUrl(bookingLink) : null),
    [bookingLink],
  );
  const previewSlug = normalizeSlugInput(slugDraft);
  const previewLink = previewSlug ? `${bookingOrigin}/b/${previewSlug}` : null;
  const hasChanges = normalizeSlugInput(slugDraft) !== persistedSlug;
  const linkPrefix = `${bookingOrigin}/b/`;

  const onSlugChange = useCallback((value: string) => {
    setSlugDraft(sanitizeSlugDraft(value));
    setError(null);
    setSuccessMessage(null);
  }, []);

  const saveSlug = useCallback(async () => {
    if (!workspaceId || !user) {
      throw new Error('Aguarde o carregamento do negócio para salvar o link.');
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const slug = parseSlugInput(slugDraft);
      const available = await isSlugAvailable(db, slug, workspaceId);
      if (!available) {
        throw new Error('Este endereço já está em uso. Escolha outro.');
      }

      await updateWorkspaceSlug(db, workspaceId, user.uid, slug);
      setPersistedSlug(slug);
      setSlugDraft(slug);
      await reload();
      setSuccessMessage('Link oficial salvo com sucesso.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao salvar o link';
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [db, reload, slugDraft, user, workspaceId]);

  const copyLink = useCallback(async () => {
    if (!bookingLink) return;
    await navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [bookingLink]);

  const shareWhatsApp = useCallback(() => {
    if (!bookingLink) return;
    const message = buildShareMessage(bookingLink, workspace?.name);
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [bookingLink, workspace?.name]);

  return {
    workspace,
    workspaceId,
    canEdit,
    isWorkspaceLoading,
    workspaceError,
    configured,
    currentSlug: persistedSlug,
    slugDraft,
    linkPrefix,
    previewLink,
    bookingLink,
    qrCodeUrl,
    hasChanges,
    isSaving,
    error,
    successMessage,
    copied,
    onSlugChange,
    saveSlug,
    copyLink,
    shareWhatsApp,
  };
}
