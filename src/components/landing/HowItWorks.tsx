const steps = [
  {
    number: "1",
    title: "Upload Photos",
    description:
      "Share 2-3 photos of your child. Our AI uses them to create illustrations that actually look like your kid.",
    emoji: "📸",
  },
  {
    number: "2",
    title: "Pick a Theme",
    description:
      "Choose from Space Adventure, Dinosaur Rescue, or Ocean Explorer. Tell us their interests and we weave them in.",
    emoji: "🎨",
  },
  {
    number: "3",
    title: "Get Your Book",
    description:
      "In minutes, get a beautifully illustrated 8-page storybook starring your child. Download as PDF instantly.",
    emoji: "📖",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="text-5xl mb-4">{step.emoji}</div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-3">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
