'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Service, Workspace } from '@socio247/domain';
import { getFirebaseClient } from '@/lib/firebase';
import {
  createPublicBooking,
  getProviderAvailability,
  getWorkspaceBySlug,
  listActiveServices,
  listAppointmentsForDay,
  listTimeBlocksForDay,
  type PublicBookingInput,
} from './booking.repository';
import { computeAvailableSlots } from './slots';
import { toLocalDateInputValue } from '@/features/agenda/datetime';

export function usePublicBooking(slug: string) {
  const { db } = getFirebaseClient();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateInputValue(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [slots, setSlots] = useState<Date[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId) ?? null,
    [selectedServiceId, services],
  );

  const loadWorkspace = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const foundWorkspace = await getWorkspaceBySlug(db, slug);
      if (!foundWorkspace) {
        setWorkspace(null);
        setServices([]);
        return;
      }

      const activeServices = await listActiveServices(db, foundWorkspace.id);
      setWorkspace(foundWorkspace);
      setServices(activeServices);
      setSelectedServiceId((current) => current || activeServices[0]?.id || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar agendamento');
      setWorkspace(null);
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [db, slug]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const loadSlots = useCallback(async () => {
    if (!workspace || !selectedService) {
      setSlots([]);
      return;
    }

    setIsSlotsLoading(true);
    setError(null);
    try {
      const [availability, appointments, timeBlocks] = await Promise.all([
        getProviderAvailability(db, workspace.id, workspace.ownerId),
        listAppointmentsForDay(db, workspace.id, selectedDate),
        listTimeBlocksForDay(db, workspace.id, selectedDate),
      ]);

      if (!availability) {
        setSlots([]);
        return;
      }

      const availableSlots = computeAvailableSlots({
        localDate: selectedDate,
        service: selectedService,
        availability,
        appointments,
        timeBlocks,
      });

      setSlots(availableSlots);
      setSelectedSlot((current) =>
        current && availableSlots.some((slot) => slot.getTime() === current.getTime())
          ? current
          : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao calcular horários');
      setSlots([]);
      setSelectedSlot(null);
    } finally {
      setIsSlotsLoading(false);
    }
  }, [db, selectedDate, selectedService, workspace]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedServiceId, selectedDate]);

  const submitBooking = useCallback(
    async (input: Omit<PublicBookingInput, 'serviceId' | 'startAt'>) => {
      if (!workspace || !selectedService || !selectedSlot) {
        throw new Error('Selecione serviço e horário');
      }

      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        const appointment = await createPublicBooking(db, workspace, {
          ...input,
          serviceId: selectedService.id,
          startAt: selectedSlot.toISOString(),
        });

        const statusMessage =
          appointment.status === 'pending'
            ? 'Pedido enviado! O profissional confirmará em breve.'
            : 'Agendamento confirmado! Te esperamos no horário escolhido.';

        setSuccessMessage(statusMessage);
        setSelectedSlot(null);
        await loadSlots();
        return appointment;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao agendar';
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [db, loadSlots, selectedService, selectedSlot, workspace],
  );

  return {
    workspace,
    services,
    selectedServiceId,
    setSelectedServiceId,
    selectedService,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    slots,
    isLoading,
    isSlotsLoading,
    isSaving,
    error,
    successMessage,
    submitBooking,
  };
}
