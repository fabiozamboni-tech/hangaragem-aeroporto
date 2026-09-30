import { useState, useEffect, useCallback } from "react";
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  ShieldCheck,
  Building,
  Plane,
  Coffee,
  Eye,
} from "lucide-react";

export interface HangarPhoto {
  id: string;
  src: string;
  alt: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  category: "all" | "fachada" | "interior" | "lounge" | "operacao";
  badgeColor?: string;
  highlights: string[];
}

export const HANGAR_PHOTOS: HangarPhoto[] = [
  {
    id: "fachada",
    src: "./images/vespair-hangar-fachada.jpg",
    alt: "Fachada frontal do Hangar 12 da Vespair Serviços Aéreos no Aeródromo Menega",
    tag: "FACHADA PRINCIPAL",
    title: "Arquitetura & Identidade Visual",
    subtitle: "Hangar 12 · Aeródromo Condomínio Menega (SIFQ)",
    description:
      "Fachada contemporânea com painéis amadeirados termoacústicos, letreiro corporativo em LED, vidros panorâmicos e portões automáticos deslizantes de alta amplitude para movimentação de aeronaves.",
    category: "fachada",
    highlights: ["Portões automatizados", "Painéis termoacústicos", "Acesso direto à Taxiway"],
  },
  {
    id: "interior",
    src: "./images/vespair-hangar-interior.jpg",
    alt: "Interior amplo do hangar da Vespair com piso epóxi de alto brilho e mezanino",
    tag: "INTERIOR · 500 M²",
    title: "Vão Livre & Piso Espelhado",
    subtitle: "Piso Epóxi Industrial de Alta Resistência",
    description:
      "Mais de 500 m² de vão livre sem colunas centrais, piso em epóxi de alto brilho que garante assepsia total, iluminação natural zenital por claraboias e mezanino executivo com salas de apoio.",
    category: "interior",
    highlights: ["Piso epóxi espelhado", "Vão livre sem colunas", "Mezanino executivo & apoio"],
  },
  {
    id: "lounge-completo",
    src: "./images/vespair-lounge-completo.jpg",
    alt: "Lounge VIP executivo Vespair com poltronas, mesa de reuniões, televisão e ambiente climatizado",
    tag: "LOUNGE VIP EXECUTIVO",
    title: "Espaço de Hospitalidade & Reuniões",
    subtitle: "Conforto Climatizado para Passageiros e Pilotos",
    description:
      "Ambiente sofisticado e privativo com poltronas de design, mesa de reunião/trabalho, televisão, Wi-Fi ultrarrápido e vista para a área de hangaragem para aguardar voos com total conforto.",
    category: "lounge",
    highlights: ["Mesa de reuniões & TV", "Ambiente 100% climatizado", "Wi-Fi de alta velocidade"],
  },
  {
    id: "lounge-bar",
    src: "./images/vespair-lounge-bar.jpg",
    alt: "Copa e bar de conveniência no Lounge VIP Vespair com frigobar e café",
    tag: "BAR & CONVENIÊNCIA",
    title: "Copa de Apoio & Bar Selecionado",
    subtitle: "Café Expresso, Bebidas e Snacks",
    description:
      "Balcão gourmet completo com máquina de café expresso, frigobar expositor com bebidas selecionadas, acabamentos em madeira nobre e o logotipo oficial Vespair.",
    category: "lounge",
    highlights: ["Máquina de café expresso", "Frigobar com bebidas", "Atendimento personalizado"],
  },
  {
    id: "patio",
    src: "./images/vespair-hangar-aviao-patio.png",
    alt: "Aeronave turboélice Piper M500 posicionada no pátio frontal do Hangar Vespair",
    tag: "PÁTIO DE MANOBRA",
    title: "Pátio Privativo & Atendimento de Solo",
    subtitle: "Embarque e Desembarque com Discrição",
    description:
      "Pátio frontal pavimentado e amplo, projetado para recepção imediata da aeronave após o taxiamento, facilitando o transbordo de passageiros, bagagens e operações de pré-voo.",
    category: "operacao",
    highlights: ["Embarque privativo", "Reboque especializado", "Apoio pré e pós-voo"],
  },
  {
    id: "por-do-sol",
    src: "./images/vespair-hangar-por-do-sol.jpg",
    alt: "Vista do pôr do sol na Serra Gaúcha a partir de dentro do Hangar Vespair",
    tag: "ENTARDECER NO HANGAR",
    title: "Operação 24 Horas & Vista Panorâmica",
    subtitle: "Segurança e Conforto em Qualquer Horário",
    description:
      "Estrutura pronta para recepção diurna e noturna. O interior do hangar proporciona ambiente protegido contra o frio e intempéries da serra, com visão privilegiada para o relevo de Flores da Cunha.",
    category: "operacao",
    highlights: ["Operação VFR Noturno", "Climatização & Proteção", "Vigilância e Monitoramento"],
  },
  {
    id: "aeronave-interna",
    src: "./images/vespair-hangar-aeronave-interna.jpg",
    alt: "Aeronave abrigada no interior do Hangar Vespair com vista para o vale",
    tag: "HANGARAGEM SEGURA",
    title: "Acomodação & Proteção para até 18m",
    subtitle: "Proteção Absoluta contra Granizo e Geada",
    description:
      "Espaço dimensionado para abrigar com folga aeronaves monomotores, bimotores e turboélices com até 18 metros de envergadura, protegendo a pintura, aviônicos e sistemas mecânicos.",
    category: "interior",
    highlights: ["Até 18 m de envergadura", "Proteção térmica total", "Tomadas de força GPU"],
  },
];

export function HangarGallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "fachada" | "interior" | "lounge" | "operacao">("all");

  const filteredPhotos =
    activeFilter === "all"
      ? HANGAR_PHOTOS
      : HANGAR_PHOTOS.filter((p) => p.category === activeFilter);

  const activePhoto = selectedPhotoIndex !== null ? HANGAR_PHOTOS[selectedPhotoIndex] : null;

  const handleNext = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => ((prev ?? 0) + 1) % HANGAR_PHOTOS.length);
  }, [selectedPhotoIndex]);

  const handlePrev = useCallback(() => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) => ((prev ?? 0) - 1 + HANGAR_PHOTOS.length) % HANGAR_PHOTOS.length);
  }, [selectedPhotoIndex]);

  // Navegação por teclado
  useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex, handleNext, handlePrev]);

  return (
    <section
      id="estrutura"
      className="relative overflow-hidden bg-[#202126] px-5 py-20 text-[#f5f1e8] sm:px-8 sm:py-28 lg:px-10 lg:py-32"
    >
      {/* Detalhe de Iluminação Decorativa */}
      <div className="absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#f4793b]/10 blur-[120px] pointer-events-none" />
      <div className="absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#f8c142]/10 blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1440px]">
        {/* Cabeçalho da Seção */}
        <div className="reveal-up flex flex-col justify-between gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow text-[#f8c142] flex items-center gap-2">
              <Building size={14} className="text-[#f4793b]" />
              INSTALAÇÕES &amp; ESTRUTURA REAL · HANGAR 12
            </p>
            <h2 className="mt-5 font-display text-4xl leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl max-w-2xl">
              Conheça as instalações da Vespair em Flores da Cunha.
            </h2>
          </div>

          <div className="flex flex-col gap-4 lg:max-w-md">
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Infraestrutura de padrão executivo projetada para oferecer segurança absoluta à aeronave, conforto térmico, agilidade de solo e privacidade aos passageiros e tripulantes.
            </p>

            {/* Filtros de Categoria */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { key: "all", label: `Todas (${HANGAR_PHOTOS.length})` },
                { key: "fachada", label: "Fachada & Pátio" },
                { key: "interior", label: "Interior & Piso Epóxi" },
                { key: "lounge", label: "Lounge VIP & Bar" },
                { key: "operacao", label: "Operação & Solo" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key as any)}
                  className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-wider transition ${
                    activeFilter === tab.key
                      ? "bg-[#f4793b] font-bold text-white shadow-[0_0_15px_rgba(244,121,59,0.35)]"
                      : "border border-white/15 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* =========================================================================
            BENTO GRID / GALERIA DE FOTOS DO HANGAR & LOUNGE
           ========================================================================= */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {/* Card 1: Fachada Principal (Grande Destaque - 7 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(0)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-2 lg:col-span-7"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#1a1a1e] sm:aspect-[16/9] lg:h-[420px]">
              <img
                src={HANGAR_PHOTOS[0].src}
                alt={HANGAR_PHOTOS[0].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/40 to-transparent" />

              {/* Tag Superior */}
              <div className="absolute left-5 top-5 z-10 flex items-center gap-2">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f8c142] backdrop-blur-md">
                  {HANGAR_PHOTOS[0].tag}
                </span>
              </div>

              {/* Botão de Zoom Hover */}
              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              {/* Legenda Inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4793b]">
                  {HANGAR_PHOTOS[0].subtitle}
                </p>
                <h3 className="mt-1 font-display text-2xl text-white sm:text-3xl">
                  {HANGAR_PHOTOS[0].title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70 line-clamp-2 sm:text-sm">
                  {HANGAR_PHOTOS[0].description}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {HANGAR_PHOTOS[0].highlights.map((hl) => (
                    <span
                      key={hl}
                      className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-white/80"
                    >
                      ✓ {hl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pátio Frontal com Aeronave (5 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(4)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-2 lg:col-span-5"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1e] lg:h-[420px]">
              <img
                src={HANGAR_PHOTOS[4].src}
                alt={HANGAR_PHOTOS[4].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/30 to-transparent" />

              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f4793b] backdrop-blur-md">
                  {HANGAR_PHOTOS[4].tag}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
                  {HANGAR_PHOTOS[4].subtitle}
                </p>
                <h3 className="mt-1 font-display text-xl text-white sm:text-2xl">
                  {HANGAR_PHOTOS[4].title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70 line-clamp-2">
                  {HANGAR_PHOTOS[4].description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {HANGAR_PHOTOS[4].highlights.map((hl) => (
                    <span
                      key={hl}
                      className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/80"
                    >
                      ✓ {hl}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Lounge VIP Completo (6 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(2)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-1 lg:col-span-6"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1e] lg:h-[380px]">
              <img
                src={HANGAR_PHOTOS[2].src}
                alt={HANGAR_PHOTOS[2].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/30 to-transparent" />

              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f8c142] backdrop-blur-md">
                  {HANGAR_PHOTOS[2].tag}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4793b]">
                  {HANGAR_PHOTOS[2].subtitle}
                </p>
                <h3 className="mt-1 font-display text-xl text-white sm:text-2xl">
                  {HANGAR_PHOTOS[2].title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70 line-clamp-2">
                  {HANGAR_PHOTOS[2].description}
                </p>
              </div>
            </div>
          </div>

          {/* Card 4: Lounge Bar & Café (6 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(3)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-1 lg:col-span-6"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1e] lg:h-[380px]">
              <img
                src={HANGAR_PHOTOS[3].src}
                alt={HANGAR_PHOTOS[3].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/30 to-transparent" />

              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f4793b] backdrop-blur-md">
                  {HANGAR_PHOTOS[3].tag}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
                  {HANGAR_PHOTOS[3].subtitle}
                </p>
                <h3 className="mt-1 font-display text-xl text-white sm:text-2xl">
                  {HANGAR_PHOTOS[3].title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-white/70 line-clamp-2">
                  {HANGAR_PHOTOS[3].description}
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: Interior Amplo & Piso Epóxi (4 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(1)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-1 lg:col-span-4"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1e] lg:h-[340px]">
              <img
                src={HANGAR_PHOTOS[1].src}
                alt={HANGAR_PHOTOS[1].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/30 to-transparent" />

              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f8c142] backdrop-blur-md">
                  {HANGAR_PHOTOS[1].tag}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4793b]">
                  {HANGAR_PHOTOS[1].subtitle}
                </p>
                <h3 className="mt-1 font-display text-lg text-white">
                  {HANGAR_PHOTOS[1].title}
                </h3>
              </div>
            </div>
          </div>

          {/* Card 6: Pôr do Sol no Hangar (4 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(5)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-1 lg:col-span-4"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1e] lg:h-[340px]">
              <img
                src={HANGAR_PHOTOS[5].src}
                alt={HANGAR_PHOTOS[5].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/30 to-transparent" />

              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f4793b] backdrop-blur-md">
                  {HANGAR_PHOTOS[5].tag}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
                  {HANGAR_PHOTOS[5].subtitle}
                </p>
                <h3 className="mt-1 font-display text-lg text-white">
                  {HANGAR_PHOTOS[5].title}
                </h3>
              </div>
            </div>
          </div>

          {/* Card 7: Aeronave Abrigada & Vista do Vale (4 Colunas) */}
          <div
            onClick={() => setSelectedPhotoIndex(6)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#2b2c31] transition-all duration-500 hover:border-[#f4793b]/70 hover:shadow-2xl sm:col-span-2 lg:col-span-4"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a1a1e] lg:h-[340px]">
              <img
                src={HANGAR_PHOTOS[6].src}
                alt={HANGAR_PHOTOS[6].alt}
                className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141518]/95 via-[#141518]/30 to-transparent" />

              <div className="absolute left-5 top-5 z-10">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[#f8c142] backdrop-blur-md">
                  {HANGAR_PHOTOS[6].tag}
                </span>
              </div>

              <div className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110">
                <Maximize2 size={15} />
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4793b]">
                  {HANGAR_PHOTOS[6].subtitle}
                </p>
                <h3 className="mt-1 font-display text-lg text-white">
                  {HANGAR_PHOTOS[6].title}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa Informativa de Diferenciais da Estrutura */}
        <div className="reveal-up mt-12 grid gap-px overflow-hidden rounded-xl border border-white/15 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col justify-between bg-[#2b2c31] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
              ESTRUTURA
            </span>
            <strong className="mt-3 font-display text-2xl text-white">
              Mais de 500 m² de vão livre
            </strong>
            <p className="mt-2 text-xs text-white/60">
              Espaço amplo e desimpedido para manobra segura de aeronaves.
            </p>
          </div>

          <div className="flex flex-col justify-between bg-[#2b2c31] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
              PISO INDUSTRIAL
            </span>
            <strong className="mt-3 font-display text-2xl text-white">
              Epóxi de alto brilho
            </strong>
            <p className="mt-2 text-xs text-white/60">
              Assepsia impecável, sem poeira ou resíduos para proteção dos motores.
            </p>
          </div>

          <div className="flex flex-col justify-between bg-[#2b2c31] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
              HOSPITALIDADE &amp; LOUNGE
            </span>
            <strong className="mt-3 font-display text-2xl text-white">
              Lounge VIP &amp; Bar Climatizado
            </strong>
            <p className="mt-2 text-xs text-white/60">
              Salas de espera e reunião com café expresso e Wi-Fi de alta velocidade.
            </p>
          </div>

          <div className="flex flex-col justify-between bg-[#2b2c31] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
              LOCALIZAÇÃO
            </span>
            <strong className="mt-3 font-display text-2xl text-white">
              Hangar 12 · Pista SIFQ
            </strong>
            <p className="mt-2 text-xs text-white/60">
              Conexão imediata com a pista de 1.022 m por Taxiway pavimentada.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          LIGHTBOX MODAL EM TELA CHEIA
         ========================================================================= */}
      {activePhoto && selectedPhotoIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 p-3 sm:p-6 backdrop-blur-lg animate-in fade-in duration-300"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div
            className="relative flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/20 bg-[#202126] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Topbar do Modal */}
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5 bg-[#2b2c31]">
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#f4793b]/20 px-2.5 py-1 font-mono text-xs font-bold text-[#f4793b]">
                  {selectedPhotoIndex + 1} / {HANGAR_PHOTOS.length}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    {activePhoto.title}
                  </h4>
                  <p className="font-mono text-[10px] text-white/60">
                    {activePhoto.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPhotoIndex(null)}
                  className="rounded-full bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
                  aria-label="Fechar galeria"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Visualizador da Imagem com Botões de Navegação */}
            <div className="relative flex min-h-[300px] max-h-[68vh] flex-1 items-center justify-center overflow-hidden bg-[#141518] p-2">
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="max-h-[64vh] w-auto max-w-full object-contain rounded-lg transition-all duration-300"
              />

              {/* Botão Anterior */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md transition hover:bg-[#f4793b] hover:scale-105 active:scale-95"
                aria-label="Foto anterior"
              >
                <ChevronLeft size={22} />
              </button>

              {/* Botão Próximo */}
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#202126]/80 text-white backdrop-blur-md transition hover:bg-[#f4793b] hover:scale-105 active:scale-95"
                aria-label="Próxima foto"
              >
                <ChevronRight size={22} />
              </button>
            </div>

            {/* Rodapé Descritivo e Miniaturas */}
            <div className="border-t border-white/10 bg-[#2b2c31] px-5 py-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs leading-relaxed text-white/80 sm:text-sm">
                    {activePhoto.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {activePhoto.highlights.map((hl) => (
                      <span
                        key={hl}
                        className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-[#f8c142]"
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Lista de Miniaturas para Troca Rápida */}
                <div className="flex shrink-0 items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {HANGAR_PHOTOS.map((photo, index) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setSelectedPhotoIndex(index)}
                      className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                        selectedPhotoIndex === index
                          ? "border-[#f4793b] ring-2 ring-[#f4793b]/50 scale-105"
                          : "border-white/20 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={photo.src}
                        alt={photo.alt}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HangarGallery;
