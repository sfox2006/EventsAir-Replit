import { useId } from "react";
import type { Values } from "../types";
export function Field({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
  options?: string[];
}) {
  const id = useId();
  return (
    <label className="field">
      <span id={id}>{label}</span>
      {options ? (
        <select
          aria-labelledby={id}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((v) => (
            <option key={v} value={v}>
              {v || "None"}
            </option>
          ))}
        </select>
      ) : (
        <input
          aria-labelledby={id}
          type={type}
          disabled={disabled}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}
export function Check({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className="check">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
export function FilterField({
  label,
  name,
  draft,
  setDraft,
  type,
  disabled,
  options,
}: {
  label: string;
  name: string;
  draft: Values;
  setDraft: (f: Values) => void;
  type?: string;
  disabled?: boolean;
  options?: string[];
}) {
  return (
    <Field
      label={label}
      value={String(draft[name] || "")}
      onChange={(v) => setDraft({ ...draft, [name]: v })}
      type={type}
      disabled={disabled}
      options={options}
    />
  );
}
export function Multi({
  label,
  name,
  options,
  draft,
  setDraft,
}: {
  label: string;
  name: string;
  options: string[];
  draft: Values;
  setDraft: (f: Values) => void;
}) {
  const selected = Array.isArray(draft[name]) ? (draft[name] as string[]) : [];
  return (
    <fieldset>
      <legend>{label}</legend>
      {options.map((v) => (
        <Check
          key={v}
          label={v}
          checked={selected.includes(v)}
          onChange={(on) =>
            setDraft({
              ...draft,
              [name]: on ? [...selected, v] : selected.filter((x) => x !== v),
            })
          }
        />
      ))}
    </fieldset>
  );
}
