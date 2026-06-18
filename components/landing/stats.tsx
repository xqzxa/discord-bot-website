const stats = [
  { value: '50,000+', label: 'Bots hosted' },
  { value: '99.99%', label: 'Uptime SLA' },
  { value: '<30s', label: 'Average deploy time' },
  { value: '3 regions', label: 'Global infrastructure' },
]

export function Stats() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-primary tabular-nums mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
