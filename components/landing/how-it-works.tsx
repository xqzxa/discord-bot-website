const steps = [
  {
    number: '01',
    title: 'Upload your bot',
    description:
      'Drag and drop your bot folder, paste a GitHub URL, or use our CLI. We support Node.js, Python, and Deno out of the box.',
  },
  {
    number: '02',
    title: 'Configure environment',
    description:
      'Set your Discord token and any other secrets as encrypted environment variables. Never hardcode credentials again.',
  },
  {
    number: '03',
    title: 'Deploy in one click',
    description:
      'Hit deploy and your bot is live in seconds. BotNest provisions a dedicated container and starts your process automatically.',
  },
  {
    number: '04',
    title: 'Monitor & scale',
    description:
      'Watch real-time logs, check uptime stats, and upgrade your plan as your server grows. We handle all the infrastructure.',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance mb-4">
            Deploy in 4 simple steps
          </h2>
          <p className="text-muted-foreground text-lg text-balance max-w-xl mx-auto leading-relaxed">
            No DevOps degree required. BotNest is designed to get your bot online fast.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.number} className="relative">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-border z-0" />
              )}
              <div className="relative z-10">
                <div className="text-4xl font-bold font-mono text-primary/30 mb-4">{step.number}</div>
                <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
