"use client";

import type { ConfirmationStats, Feira } from "@/types/feira";
import { formatDays } from "@/lib/days";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { FeiraBadges, HoursText } from "@/components/FeiraBadges";
import { ConfirmBar } from "@/components/feira/ConfirmBar";
import { PostFeed } from "@/components/feira/PostFeed";
import type { MyConfirmation, ConfirmationStatus } from "@/lib/repositories/feedback";

interface Props {
  feira: Feira | null;
  onClose: () => void;
  stats?: ConfirmationStats;
  myConfirmation?: MyConfirmation;
  onConfirm: (feira: Feira, status: ConfirmationStatus) => Promise<void>;
  onSuggestChange: (feira: Feira) => void;
}

export function FeiraDetailsModal({
  feira,
  onClose,
  stats,
  myConfirmation,
  onConfirm,
  onSuggestChange,
}: Props) {
  const { enabled } = useAuth();
  if (!feira) return null;

  return (
    <Modal
      open
      onClose={onClose}
      title={feira.name}
      eyebrow={`${feira.neighborhood} · ${feira.city}`}
      icon="🧺"
      size="lg"
    >
      <div className="space-y-4">
        <section aria-label="Informações da feira" className="space-y-1.5 text-sm text-stone-700">
          <p>
            <strong>Dias:</strong> {formatDays(feira.daysOfWeek)}
          </p>
          <p>
            <strong>Horário:</strong> <HoursText hours={feira.hours} />
          </p>
          {feira.address && (
            <p>
              <strong>Endereço:</strong> {feira.address}
            </p>
          )}
          <p className="text-xs text-stone-500">
            <strong>Fonte:</strong> {feira.source}
          </p>
          <FeiraBadges feira={feira} stats={stats} />
          <div className="flex flex-wrap gap-3 pt-1 text-xs font-semibold">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${feira.lat},${feira.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline"
            >
              Como chegar ↗
            </a>
            {enabled && (
              <button
                type="button"
                onClick={() => onSuggestChange(feira)}
                className="text-amber-700 hover:underline"
              >
                Sugerir correção
              </button>
            )}
          </div>
        </section>

        {enabled ? (
          <>
            <ConfirmBar feira={feira} myConfirmation={myConfirmation} onConfirm={onConfirm} />
            <PostFeed feira={feira} />
          </>
        ) : (
          <Alert kind="info">O mural de relatos e preços estará disponível em breve.</Alert>
        )}
      </div>
    </Modal>
  );
}
