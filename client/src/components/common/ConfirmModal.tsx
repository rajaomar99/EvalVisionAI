interface ConfirmModalProps {
  open:        boolean;
  title:       string;
  message:     string;
  confirmText?: string;
  onConfirm:   () => void;
  onCancel:    () => void;
}

export default function ConfirmModal({ open, title, message, confirmText, onConfirm, onCancel }: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-sm bg-white p-6 ">
        <h3 className="text-lg font-bold text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm text-zinc-500">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-sm border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-sm bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
