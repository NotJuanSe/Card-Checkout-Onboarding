interface IconProps {
  readonly className?: string;
}

/** Iconos de trazo (estilo Lucide) embebidos: sin dependencias ni peticiones extra. */
function Svg({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="presentation"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function LockIcon(_: IconProps) {
  return (
    <Svg>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </Svg>
  );
}

export function BagIcon(_: IconProps) {
  return (
    <Svg>
      <path d="M6 7h12l-1 13H7L6 7Z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </Svg>
  );
}

export function CreditCardIcon(_: IconProps) {
  return (
    <Svg>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
    </Svg>
  );
}

export function TruckIcon(_: IconProps) {
  return (
    <Svg>
      <path d="M3 16V6h11v10" />
      <path d="M14 9h4l3 3v4h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </Svg>
  );
}

export function CheckIcon(_: IconProps) {
  return (
    <Svg>
      <path d="m5 13 4.5 4.5L19 7" />
    </Svg>
  );
}

export function AlertIcon(_: IconProps) {
  return (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </Svg>
  );
}

export function SpinnerIcon(_: IconProps) {
  return (
    <Svg>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </Svg>
  );
}

export function ReceiptIcon(_: IconProps) {
  return (
    <Svg>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3Z" />
      <path d="M9 8h6M9 12h6" />
    </Svg>
  );
}
