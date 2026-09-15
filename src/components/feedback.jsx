export function Loading({ label = "Loading..." }) {
  return <p style={{ color: "#6b7280", padding: "12px 0" }}>{label}</p>;
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#991b1b",
        padding: "12px 14px",
        borderRadius: 8,
        marginBottom: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            border: "1px solid #fecaca",
            background: "white",
            borderRadius: 6,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}

export function Toast({ message, kind = "success" }) {
  if (!message) return null;
  const bg = kind === "success" ? "#ecfdf5" : "#fef2f2";
  const border = kind === "success" ? "#a7f3d0" : "#fecaca";
  const color = kind === "success" ? "#065f46" : "#991b1b";
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        color,
        padding: "12px 14px",
        borderRadius: 8,
        marginBottom: 16,
      }}
    >
      {message}
    </div>
  );
}
