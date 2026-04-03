"use client";

import { useState, useCallback } from "react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface FormValues {
  dni:           string;
  nombre:        string;
  apellido:      string;
  email:         string;
  telefono:      string;
  _hp:           string; // honeypot — oculto a usuarios reales
}

interface FormErrors {
  dni?:      string;
  nombre?:   string;
  apellido?: string;
  email?:    string;
  general?:  string;
}

// ── Validación client-side ────────────────────────────────────────────────────
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const dniClean = values.dni.replace(/\D/g, "");
  if (!dniClean) {
    errors.dni = "El DNI es obligatorio";
  } else if (dniClean.length < 7 || dniClean.length > 8) {
    errors.dni = "El DNI debe tener 7 u 8 dígitos";
  }

  if (!values.nombre.trim()) {
    errors.nombre = "El nombre es obligatorio";
  }

  if (!values.apellido.trim()) {
    errors.apellido = "El apellido es obligatorio";
  }

  const emailRE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!values.email.trim()) {
    errors.email = "El email es obligatorio";
  } else if (!emailRE.test(values.email)) {
    errors.email = "El email no es válido";
  }

  return errors;
}

// ── Componente de campo ───────────────────────────────────────────────────────
function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-nunito text-xs font-bold uppercase tracking-widest mb-1.5
                   text-gp-text-dim"
      >
        {label}{" "}
        {optional && (
          <span className="text-gp-muted font-normal normal-case tracking-normal">
            (opcional)
          </span>
        )}
        {!optional && <span className="text-gp-orange ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs font-nunito text-red-400 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ── Estado de éxito ───────────────────────────────────────────────────────────
function SuccessScreen({ nombre }: { nombre: string }) {
  return (
    <div className="py-10 flex flex-col items-center text-center">
      <div className="text-7xl mb-4 animate-bounce">🎉</div>
      <h3 className="font-fredoka text-3xl md:text-4xl gradient-text mb-2">
        ¡Listo, {nombre}!
      </h3>
      <p className="font-nunito text-white/85 text-lg mb-2">
        Tu asistencia está confirmada 🥳
      </p>
      <p className="font-nunito text-gp-text-dim text-sm max-w-xs">
        El día del cumple te mandamos un recordatorio al mail con todos los detalles.
      </p>
      <div className="mt-6 flex gap-3 text-3xl">
        <span style={{ animation: "float 2.5s ease-in-out infinite" }}>🎈</span>
        <span style={{ animation: "float 3s ease-in-out infinite", animationDelay: "0.5s" }}>⭐</span>
        <span style={{ animation: "float 2s ease-in-out infinite", animationDelay: "1s" }}>🎊</span>
      </div>
    </div>
  );
}

// ── Formulario principal ──────────────────────────────────────────────────────
export default function RSVPForm({ onSuccess }: { onSuccess?: (count: number) => void }) {
  const [values, setValues] = useState<FormValues>({
    dni: "", nombre: "", apellido: "", email: "", telefono: "", _hp: "",
  });
  const [errors, setErrors]     = useState<FormErrors>({});
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [confirmedName, setConfirmedName] = useState("");

  // Actualizar campo
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      // Limpiar error del campo al editar
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [errors]
  );

  // Formatear DNI: solo dígitos, máx 8
  const handleDNIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").substring(0, 8);
    setValues((prev) => ({ ...prev, dni: clean }));
    if (errors.dni) setErrors((prev) => ({ ...prev, dni: undefined }));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll al primer error
      const firstErrorField = Object.keys(validationErrors)[0];
      document.getElementById(firstErrorField)?.focus();
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setErrors({ general: data.error || "Ocurrió un error. Intentá de nuevo." });
        return;
      }

      // ¡Éxito!
      setConfirmedName(values.nombre);
      setSuccess(true);
      if (onSuccess && typeof data.count === "number") {
        onSuccess(data.count);
      }
    } catch {
      setErrors({ general: "Error de conexión. Verificá tu internet e intentá de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  // ── Render: pantalla de éxito ─────────────────────────────────────────────
  if (success) return <SuccessScreen nombre={confirmedName} />;

  // ── Render: formulario ────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="w-full">
      <div className="space-y-4">

        {/* DNI */}
        <Field id="dni" label="DNI" error={errors.dni}>
          <input
            id="dni"
            name="dni"
            type="text"
            inputMode="numeric"
            value={values.dni}
            onChange={handleDNIChange}
            placeholder="Ej: 40123456"
            autoComplete="off"
            className={`input-field w-full rounded-xl px-4 py-3 font-nunito text-base
                        ${errors.dni ? "error" : ""}`}
          />
        </Field>

        {/* Nombre + Apellido en la misma fila en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id="nombre" label="Nombre" error={errors.nombre}>
            <input
              id="nombre"
              name="nombre"
              type="text"
              value={values.nombre}
              onChange={handleChange}
              placeholder="Ej: Sofía"
              autoComplete="given-name"
              className={`input-field w-full rounded-xl px-4 py-3 font-nunito text-base
                          ${errors.nombre ? "error" : ""}`}
            />
          </Field>

          <Field id="apellido" label="Apellido" error={errors.apellido}>
            <input
              id="apellido"
              name="apellido"
              type="text"
              value={values.apellido}
              onChange={handleChange}
              placeholder="Ej: González"
              autoComplete="family-name"
              className={`input-field w-full rounded-xl px-4 py-3 font-nunito text-base
                          ${errors.apellido ? "error" : ""}`}
            />
          </Field>
        </div>

        {/* Email */}
        <Field id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            autoComplete="email"
            inputMode="email"
            className={`input-field w-full rounded-xl px-4 py-3 font-nunito text-base
                        ${errors.email ? "error" : ""}`}
          />
        </Field>

        {/* Teléfono (opcional) */}
        <Field id="telefono" label="Teléfono" optional>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            value={values.telefono}
            onChange={handleChange}
            placeholder="11 1234-5678"
            autoComplete="tel"
            inputMode="tel"
            className="input-field w-full rounded-xl px-4 py-3 font-nunito text-base"
          />
        </Field>

        {/* ── Honeypot anti-spam (invisible para humanos) ──────────────────── */}
        <div className="hidden" aria-hidden="true" tabIndex={-1}>
          <input
            name="_hp"
            type="text"
            value={values._hp}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Error general */}
        {errors.general && (
          <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/40">
            <p className="font-nunito text-sm text-red-400 flex items-center gap-2">
              <span>❌</span>
              {errors.general}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 px-6 rounded-2xl font-fredoka text-xl md:text-2xl
                     text-white disabled:opacity-60 disabled:cursor-not-allowed
                     disabled:transform-none disabled:shadow-none"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="spinner" />
              <span className="font-nunito text-base">Guardando...</span>
            </span>
          ) : (
            "¡Confirmar asistencia! 🙋"
          )}
        </button>

        <p className="text-center font-nunito text-xs text-gp-muted">
          * Campos obligatorios. Tus datos son privados y solo se usan para organizar el evento.
        </p>
      </div>
    </form>
  );
}
