import { HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi2";

export default function StatusBanner({ message }) {
  const isSuccess = message.includes("success");
  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isSuccess
          ? "border-green-200 bg-green-50 text-green-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {isSuccess ? (
        <HiOutlineCheckCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <HiOutlineExclamationCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <p>{message}</p>
    </div>
  );
}
