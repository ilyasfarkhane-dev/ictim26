import { HiOutlineXMark } from "react-icons/hi2";

export default function DashModal({ title, open, onClose, children, wide }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className={`relative w-full ${wide ? "max-w-2xl" : "max-w-lg"} dash-card p-6 max-h-[90vh] overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-dash-text">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-dash-muted hover:bg-blue-50 hover:text-dash-text transition-colors duration-200 cursor-pointer dash-focus-ring"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
