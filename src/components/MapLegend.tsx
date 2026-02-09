export function MapLegend() {
  const items = [
    { color: '#c1519c', label: 'People' },
    { color: '#e088c0', label: 'Posts' },
    { color: '#1093ed', label: 'Services' },
    { color: '#3b82f6', label: 'You' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-full border-2 border-white shadow-sm"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  )
}
