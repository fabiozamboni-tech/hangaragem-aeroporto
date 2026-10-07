import { useState, useEffect, useCallback } from "react";
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Building,
} from "lucide-react";

interface HangarPhoto {
  id: string;
  src: string;
  alt: string;
  tag: string;
  title: string;
  subtitle: string;
  description: string;
  category: "all" | "fachada" | "interior" | "seguranca";
}

const HANGAR_PHOTOS: HangarPhoto[] = [
  {
    id: "fachada",
    src: "./images/vespair-hangar-fachada.jpg",
    alt: "Fachada frontal do Hangar Vespair no Aeródromo Menega",
    tag: "FACHADA PRINCIPAL",
    title: "Fachada Principal do Hangar Vespair",
    subtitle: "Aeródromo Condomínio Menega · SIFQ",
    description:
      "Arquitetura contemporânea com painéis amadeirados termoacústicos, letreiro corporativo em LED, vidros panorâmicos e portões automáticos deslizantes para movimentação de aeronaves.",
    category: "fachada",
  },
  {
    id: "interior",
    src: "./images/vespair-hangar-interior.jpg",
    alt: "Interior amplo do hangar da Vespair com piso epóxi de alto brilho e mezanino",
    tag: "INTERIOR · 500 M²",
    title: "Vão Livre & Piso Espelhado",
    subtitle: "Piso Epóxi Industrial de Alta Resistência",
    description:
      "Mais de 500 m² de vão livre sem colunas centrais, piso em epóxi de alto brilho que garante assepsia total, iluminação natural zenital por claraboias e mezanino executivo de apoio.",
    category: "interior",
  },
  {
    id: "seguranca-conforto",
    src: "./images/vespair-hangar-por-do-sol.jpg",
    alt: "Vista do entardecer na Serra Gaúcha a partir de dentro do Hangar Vespair",
    tag: "Segurança e Conforto 24h",
    title: "Segurança e Conforto 24h",
    subtitle: "Operação Contínua & Proteção Térmica",
    description:
      "Estrutura completa pronta para recepção diurna e noturna. Ambiente interno protegido contra intempéries climáticas da serra com vista privilegiada para o vale de Flores da Cunha.",
    category: "seguranca",
  },
];

export function HangarGallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "fachada" | "interior" | "seguranca">("all");

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

  // Navegação por teclado no Lightbox
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
              INSTALAÇÕES &amp; ESTRUTURA REAL · VESPAIR
            </p>
            <h2 className="mt-5 font-display text-4xl leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl max-w-2xl">
              Conheça as instalações da Vespair em Flores da Cunha.
            </h2>
          </div>

          <div className="flex flex-col gap-4 lg:max-w-md">
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Infraestrutura de padrão executivo projetada para oferecer segurança absoluta à aeronave, conforto térmico, piso industrial de alta resistência e acesso imediato à pista SIFQ.
            </p>

            {/* Filtros Rápidos */}
            <div className="flex flex-wrap gap-2 pt-2">
              {[
                { key: "all", label: `Todas as fotos (${HANGAR_PHOTOS.length})` },
                { key: "fachada", label: "Fachada Principal" },
                { key: "interior", label: "Interior & Piso Epóxi" },
                { key: "seguranca", label: "Segurança e Conforto 24h" },
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
            GRID DE FOTOS DO HANGAR (Apenas imagens + tags sobrepostas)
           ========================================================================= */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPhotos.map((photo, index) => {
            const originalIndex = HANGAR_PHOTOS.findIndex((p) => p.id === photo.id);
            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhotoIndex(originalIndex >= 0 ? originalIndex : index)}
                className="group relative aspect-[16/11] w-full cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-[#1a1a1e] shadow-xl transition-all duration-500 hover:border-[#f4793b] hover:shadow-2xl hover:shadow-[#f4793b]/10 sm:aspect-[4/3] lg:min-h-[380px]"
              >
                {/* Imagem */}
                <img
                  data-cms-id={`gallery-photo-${photo.id}`}
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Gradientes sutis sobrepostos */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-80 transition-opacity duration-300 group-hover:opacity-60" />

                {/* Tag Sobreposta na Imagem (Canto Superior Esquerdo) */}
                <div className="absolute left-4 top-4 z-10 sm:left-5 sm:top-5">
                  <span className="inline-flex items-center rounded-md border border-white/25 bg-[#202126]/90 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#f8c142] shadow-lg backdrop-blur-md transition-colors group-hover:border-[#f4793b]/60">
                    {photo.tag}
                  </span>
                </div>

                {/* Botão de Zoom Hover (Canto Superior Direito) */}
                <div className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#202126]/85 text-white shadow-lg backdrop-blur-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 sm:right-5 sm:top-5">
                  <Maximize2 size={15} />
                </div>

                {/* Dica de Clique Hover (Canto Inferior) */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:bottom-5 sm:left-5 sm:right-5">
                  <span className="font-mono text-[10px] text-white/80">
                    Clique para ampliar em alta resolução
                  </span>
                  <Maximize2 size={13} className="text-[#f4793b]" />
                </div>
              </div>
            );
          })}
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
              Espaço amplo e desimpedido para manobra segura de aeronaves com até 18 m de envergadura.
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
              Assepsia impecável, sem poeira ou resíduos para proteção dos motores e aviônicos.
            </p>
          </div>

          <div className="flex flex-col justify-between bg-[#2b2c31] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
              SEGURANÇA &amp; CLIMA
            </span>
            <strong className="mt-3 font-display text-2xl text-white">
              Proteção contra intempéries
            </strong>
            <p className="mt-2 text-xs text-white/60">
              Fechamento com isolamento térmico, proteção contra granizo e monitoramento 24h.
            </p>
          </div>

          <div className="flex flex-col justify-between bg-[#2b2c31] p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">
              LOCALIZAÇÃO
            </span>
            <strong className="mt-3 font-display text-2xl text-white">
              Hangar Vespair · Pista SIFQ
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
