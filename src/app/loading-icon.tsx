export function LoadingIcon({ size = 56 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent p-2"
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/loading.gif" alt="Loading" className="h-full w-full object-contain" />
    </span>
  );
}
