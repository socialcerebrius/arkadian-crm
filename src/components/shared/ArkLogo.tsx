import Image from "next/image";

export function ArkLogo({
  variant = "white",
  className = "",
}: {
  variant?: "white" | "gold";
  className?: string;
}) {
  const src = "/arkadians-logo.svg";

  return (
    <div className={className} aria-label="The Arkadians">
      <Image
        src={src}
        alt="The Arkadians"
        width={160}
        height={48}
        priority
        className={variant === "gold" ? "opacity-90" : ""}
      />
    </div>
  );
}

