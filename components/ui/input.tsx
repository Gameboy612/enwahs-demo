"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-line bg-white text-sm text-ink shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

const errorControl = "border-red-300 focus:border-red-500 focus:ring-red-500/10";

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600"
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    className,
    containerClassName,
    label,
    hint,
    error,
    leftIcon,
    rightSlot,
    id,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  return (
    <FieldShell
      id={inputId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            control,
            "h-10 px-3.5",
            leftIcon && "pl-10",
            rightSlot && "pr-10",
            error && errorControl,
            className,
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
    </FieldShell>
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    { className, containerClassName, label, hint, error, id, required, ...props },
    ref,
  ) {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    return (
      <FieldShell
        id={textareaId}
        label={label}
        hint={hint}
        error={error}
        required={required}
        className={containerClassName}
      >
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            control,
            "min-h-[104px] resize-y px-3.5 py-3 leading-relaxed",
            error && errorControl,
            className,
          )}
          {...props}
        />
      </FieldShell>
    );
  },
);

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  containerClassName?: string;
  options: SelectOption[];
  placeholder?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    className,
    containerClassName,
    label,
    hint,
    error,
    id,
    required,
    options,
    placeholder,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  return (
    <FieldShell
      id={selectId}
      label={label}
      hint={hint}
      error={error}
      required={required}
      className={containerClassName}
    >
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          aria-invalid={error ? true : undefined}
          className={cn(
            control,
            "h-10 appearance-none px-3.5 pr-9",
            error && errorControl,
            className,
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
    </FieldShell>
  );
});

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-5 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 disabled:opacity-50",
          checked ? "bg-teal-500" : "bg-slate-200",
        )}
      >
        <span
          className={cn(
            "inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[23px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
}
