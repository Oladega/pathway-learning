"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
} from "react";
export function Modal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="overlay" />
        <Dialog.Content className="modal">
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Description className="sr-only">
            Review details and save changes.
          </Dialog.Description>
          <Dialog.Close className="close" aria-label="Close dialog">
            ×
          </Dialog.Close>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Header({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <p className="eyebrow">YOUR PERSONAL LEARNING OS</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions}
    </header>
  );
}
export function Progress({ value }: { value: number }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Completion"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>;
}
export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {isValidElement(children)
        ? cloneElement(children as ReactElement<{ id?: string }>, { id })
        : children}
    </div>
  );
}
export function num(fd: FormData, key: string, fallback = 0) {
  const value = fd.get(key);
  return value === null || value === "" ? fallback : Number(value);
}
export function str(fd: FormData, key: string) {
  return String(fd.get(key) ?? "");
}
export function stamp() {
  return new Date().toISOString();
}
export function uuid() {
  return crypto.randomUUID();
}
