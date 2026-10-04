"use client";

import { useId, useState, type FormEvent } from "react";
import type { DayOfWeek, Feira } from "@/types/feira";
import {
  feiraChangeSuggestionSchema,
  newFeiraSuggestionSchema,
  type FeiraChangeSuggestion,
} from "@/types/community";
import { DAYS_OF_WEEK } from "@/lib/days";
import { CITY_CENTERS, DEFAULT_CENTER } from "@/lib/cityCenters";
import { useAuth } from "@/lib/auth/AuthProvider";
import { friendlyError } from "@/lib/format";
import { suggestFeiraChange, suggestNewFeira } from "@/lib/repositories/feedback";
import { Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/Alert";
import { LocationPicker } from "@/components/map";
import type { LatLng } from "@/components/map/LocationPicker";

export type SuggestionTarget = { kind: "nova"; city: string } | { kind: "alteracao"; feira: Feira };

const input =
  "w-full rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200";
const labelCls = "mb-1 block text-sm font-semibold text-stone-700";

export function SuggestionModal({
  target,
  cities,
  onClose,
}: {
  target: SuggestionTarget | null;
  cities: string[];
  onClose: () => void;
}) {
  if (!target) return null;
  // `key` reinicia o formulário a cada abertura.
  const key = target.kind === "nova" ? "nova" : target.feira.id;
  return <SuggestionForm key={key} target={target} cities={cities} onClose={onClose} />;
}

function SuggestionForm({
  target,
  cities,
  onClose,
}: {
  target: SuggestionTarget;
  cities: string[];
  onClose: () => void;
}) {
  const { supabase, user, openAuthModal } = useAuth();
  const ids = useId();
  const original = target.kind === "alteracao" ? target.feira : null;

  const [name, setName] = useState(original?.name ?? "");
  const [city, setCity] = useState(original?.city ?? (target.kind === "nova" ? target.city : ""));
  const [neighborhood, setNeighborhood] = useState(original?.neighborhood ?? "");
  const [address, setAddress] = useState(original?.address ?? "");
  const [hours, setHours] = useState(original?.hours ?? "");
  const [days, setDays] = useState<DayOfWeek[]>(original?.daysOfWeek ?? []);
  const [location, setLocation] = useState<LatLng | null>(null);
  const [closed, setClosed] = useState(false);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const center = CITY_CENTERS[city] ?? DEFAULT_CENTER;

  const toggleDay = (d: DayOfWeek) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Seu aparelho não permite obter a localização.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setError("Não foi possível obter sua localização. Marque no mapa.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!user) {
      openAuthModal();
      return;
    }
    setError(null);
    const note = comment.trim() ? comment.trim().slice(0, 500) : null;

    try {
      if (target.kind === "nova") {
        if (!location) {
          setError("Marque no mapa onde a feira acontece.");
          return;
        }
        const parsed = newFeiraSuggestionSchema.safeParse({
          name,
          city,
          neighborhood,
          address,
          hours,
          daysOfWeek: days,
          lat: location.lat,
          lng: location.lng,
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message ?? "Verifique os campos");
          return;
        }
        setStatus("sending");
        await suggestNewFeira(supabase, user.id, parsed.data, note);
      } else {
        const f = target.feira;
        const changes: Record<string, unknown> = {};
        if (closed) changes.active = false;
        if (name.trim() !== f.name) changes.name = name;
        if (neighborhood.trim() !== f.neighborhood) changes.neighborhood = neighborhood;
        if (address.trim() !== (f.address ?? "")) changes.address = address;
        if (hours.trim() !== (f.hours ?? "")) changes.hours = hours;
        if ([...days].sort().join() !== [...f.daysOfWeek].sort().join()) changes.daysOfWeek = days;
        const parsed = feiraChangeSuggestionSchema.safeParse(changes);
        if (!parsed.success) {
          setError(
            Object.keys(changes).length === 0
              ? "Altere pelo menos um campo ou marque que a feira não existe mais."
              : (parsed.error.issues[0]?.message ?? "Verifique os campos"),
          );
          return;
        }
        setStatus("sending");
        await suggestFeiraChange(
          supabase,
          user.id,
          f.id,
          parsed.data as FeiraChangeSuggestion,
          note,
        );
      }
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      setError(friendlyError(err));
    }
  };

  const title = target.kind === "nova" ? "Sugerir nova feira" : "Sugerir correção";

  return (
    <Modal open onClose={onClose} title={title} icon="📍" size="lg">
      {status === "sent" ? (
        <div className="space-y-3">
          <Alert kind="success">
            Obrigado! Sua sugestão foi enviada e será revisada pela moderação.
          </Alert>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-amber-600 px-4 py-2.5 font-semibold text-white hover:bg-amber-700"
          >
            Fechar
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3" noValidate>
          <p className="text-sm text-stone-600">
            Sugestões são revisadas antes de aparecer no mapa. Informe só o que você sabe com
            certeza.
          </p>

          {target.kind === "alteracao" && (
            <label className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/60 p-2.5 text-sm font-medium text-rose-800">
              <input
                type="checkbox"
                checked={closed}
                onChange={(e) => setClosed(e.target.checked)}
                className="h-4 w-4 accent-rose-600"
              />
              Esta feira não existe mais / não acontece neste local
            </label>
          )}

          <div>
            <label htmlFor={`${ids}-name`} className={labelCls}>
              Nome da feira
            </label>
            <input
              id={`${ids}-name`}
              className={input}
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor={`${ids}-city`} className={labelCls}>
                Cidade
              </label>
              <input
                id={`${ids}-city`}
                className={input}
                maxLength={60}
                list={`${ids}-cities`}
                value={city}
                disabled={target.kind === "alteracao"}
                onChange={(e) => setCity(e.target.value)}
              />
              <datalist id={`${ids}-cities`}>
                {cities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label htmlFor={`${ids}-bairro`} className={labelCls}>
                Bairro
              </label>
              <input
                id={`${ids}-bairro`}
                className={input}
                maxLength={80}
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor={`${ids}-addr`} className={labelCls}>
              Endereço (opcional)
            </label>
            <input
              id={`${ids}-addr`}
              className={input}
              maxLength={200}
              placeholder="Rua, número ou referência"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <fieldset>
            <legend className={labelCls}>Dias da semana</legend>
            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  aria-pressed={days.includes(d.value)}
                  onClick={() => toggleDay(d.value)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    days.includes(d.value)
                      ? "bg-amber-500 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor={`${ids}-hours`} className={labelCls}>
              Horário (opcional)
            </label>
            <input
              id={`${ids}-hours`}
              className={input}
              maxLength={40}
              placeholder="Ex.: 07:00–13:00"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          {target.kind === "nova" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Local no mapa</span>
                <button
                  type="button"
                  onClick={useMyLocation}
                  disabled={locating}
                  className="text-xs font-semibold text-amber-700 hover:underline disabled:opacity-60"
                >
                  {locating ? "Localizando…" : "Usar minha localização"}
                </button>
              </div>
              <LocationPicker value={location} initialCenter={center} onChange={setLocation} />
              <p className="text-xs text-stone-500">
                {location
                  ? `Marcado: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)} (arraste para ajustar)`
                  : "Toque no mapa onde a feira acontece."}
              </p>
            </div>
          )}

          <div>
            <label htmlFor={`${ids}-comment`} className={labelCls}>
              Comentário para a moderação (opcional)
            </label>
            <textarea
              id={`${ids}-comment`}
              rows={2}
              maxLength={500}
              className={`${input} resize-none`}
              placeholder="Como você sabe disso? Ex.: frequento toda semana, placa da prefeitura…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          {error && <Alert kind="error">{error}</Alert>}

          <button
            type="submit"
            disabled={status === "sending"}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5 font-semibold text-white shadow-md hover:from-amber-600 hover:to-orange-600 disabled:opacity-60"
          >
            {status === "sending" ? "Enviando…" : "Enviar sugestão"}
          </button>
        </form>
      )}
    </Modal>
  );
}
