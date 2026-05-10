interface Props {
  name: string;
  className?: string;
  filled?: boolean;
  size?: number;
}

export function Icon({ name, className = '', filled, size }: Props) {
  const style = size ? { fontSize: `${size}px` } : undefined;
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'msf' : ''} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}
