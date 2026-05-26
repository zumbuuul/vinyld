interface HeroSectionProps {
  heroSrc: string;
}

export function HeroSection({ heroSrc }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#131313]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url('${heroSrc}')`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#131313] via-[rgba(19,19,19,0.8)] to-transparent" />

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-24">
        <div className="max-w-2xl">
          <h1 className="text-8xl font-serif font-bold mb-8 leading-tight tracking-tight">
            Svaka Ploca
            <br />
            Prica
            <br />
            <span className="italic text-[#ffb59e]">Pricu.</span>
          </h1>
          <p className="text-xl text-[#e6beb2] mb-12 leading-relaxed max-w-lg font-sans">
            Mesto okpljanja za muzicke entuzijaste. Podeli svoj ukus i povezi se sa prijateljima.
          </p>
          <div className="flex gap-4">
            <button className="px-8 py-4 rounded bg-gradient-to-r from-[#ffb59e] to-[#ff5717] text-[#521300] font-serif font-bold hover:from-[#ffb59e] hover:to-[#ff6b2d] transition">
              Zapocni svoju kolekciju
            </button>
            <button className="px-8 py-4 rounded bg-[#2a2a2a] text-[#e5e2e1] font-sans font-medium hover:bg-[#353534] transition">
              Istrazi police
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
