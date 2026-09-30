/**
 * DESIGN SYSTEM — Pista de Cobre
 * Página editorial cinematográfica com azul profundo, marfim, grafite e cobre de balizamento.
 * A composição usa assimetria, etiquetas técnicas e recortes diagonais para evocar uma aproximação de pista.
 */
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  Coffee,
  Fuel,
  Instagram,
  MapPin,
  Menu,
  Plane,
  Share2,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Wifi,
  X,
} from "lucide-react";
import { RouteMap } from "@/components/RouteMap";
import { HangarGallery } from "@/components/HangarGallery";

gsap.registerPlugin(ScrollTrigger);

const assets = {
  hero: "./images/vespair-hero.jpg",
  aerodromo: "./images/vespair-aerodromo.jpg",
  loungeCompleto: "./images/vespair-lounge-completo.jpg",
  loungeBar: "./images/vespair-lounge-bar.jpg",
  lounge: "./images/vespair-lounge-completo.jpg",
  aviaoPatio: "./images/vespair-aviao-patio-real.jpg",
  asa: "./images/vespair-aviao-patio-real.jpg",
  logo: "./images/vespair-logo.svg",
};

const serviceCards = [
  {
    number: "01",
    title: "Hangaragem",
    description:
      "Espaço protegido e pronto para receber aeronaves com até 18 metros de envergadura.",
    icon: Plane,
  },
  {
    number: "02",
    title: "Atendimento de solo",
    description:
      "Apoio técnico e operacional para a aeronave, do pouso ao próximo plano de voo.",
    icon: ShieldCheck,
  },
  {
    number: "03",
    title: "Lounge reservado",
    description:
      "Ambientes exclusivos para passageiros e tripulação seguirem o dia com tranquilidade.",
    icon: Coffee,
  },
  {
    number: "04",
    title: "Conveniência sob medida",
    description:
      "Abastecimento, limpeza, Wi‑Fi, transporte e alimentação organizados conforme a sua chegada.",
    icon: Sparkles,
  },
];

const serviceDetails = [
  { label: "Salas exclusivas", icon: ShieldCheck },
  { label: "Limpeza de aeronaves", icon: Sparkles },
  { label: "Abastecimento", icon: Fuel },
  { label: "Bebidas e comida", icon: UtensilsCrossed },
  { label: "Wi‑Fi", icon: Wifi },
  { label: "Atendimento 24h", icon: Clock3 },
];

const navItems = [
  ["A Vespair", "#vespair"],
  ["Estrutura", "#estrutura"],
  ["Serviços", "#servicos"],
  ["Aeródromo", "#aerodromo"],
  ["Localização", "#localizacao"],
];

function scrollToId(id: string) {
  const element = document.querySelector(id);
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || !root.current) return;

    const context = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
      intro
        .set(".hero-main-image", { scale: 1.16, xPercent: -2, opacity: 0.92 })
        .set(".hero-window", { clipPath: "inset(8% 10% 8% 10% round 17%" })
        .set(".hero-door-left, .hero-door-right", { xPercent: 0 })
        .to(".hero-door-left", { xPercent: -104, duration: 1.45, ease: "power4.inOut" }, 0.16)
        .to(".hero-door-right", { xPercent: 104, duration: 1.45, ease: "power4.inOut" }, 0.16)
        .to(".hero-window", { clipPath: "inset(0% 0% 0% 0% round 0%", duration: 1.65, ease: "power3.inOut" }, 0.3)
        .to(".hero-main-image", { scale: 1, xPercent: 0, opacity: 1, duration: 1.9, ease: "power2.out" }, 0.3)
        .fromTo(".hero-hud", { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.12)
        .fromTo(".hero-kicker", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45 }, 1.25)
        .fromTo(".hero-title-line", { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.12, ease: "power4.out" }, 1.35)
        .fromTo(".hero-copy, .hero-actions", { y: 22, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.12, duration: 0.55 }, 1.73)
        .fromTo(".hero-meta", { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 1.92)
        .fromTo(".hero-side-word", { x: 32, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7 }, 1.45);

      gsap.to(".hero-main-image", {
        yPercent: 12,
        scale: 1.1,
        ease: "none",
        scrollTrigger: { trigger: "#inicio", start: "top top", end: "bottom top", scrub: 0.75 },
      });
      gsap.to(".hero-foreground", {
        yPercent: -17,
        ease: "none",
        scrollTrigger: { trigger: "#inicio", start: "top top", end: "bottom top", scrub: 0.8 },
      });
      gsap.to(".hero-route", {
        scaleX: 1.3,
        transformOrigin: "left center",
        ease: "none",
        scrollTrigger: { trigger: "#inicio", start: "15% top", end: "bottom top", scrub: 0.75 },
      });

      gsap.utils.toArray<HTMLElement>(".reveal-up").forEach((element) => {
        gsap.fromTo(
          element,
          { y: 48, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 86%", once: true },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".scene-image").forEach((element) => {
        const media = element.querySelector("img");
        const timeline = gsap.timeline({ scrollTrigger: { trigger: element, start: "top 82%", once: true } });
        timeline
          .fromTo(element, { y: 46, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" })
          .fromTo(media, { scale: 1.28 }, { scale: 1.2, duration: 1.35, ease: "power3.out" }, 0);
      });

      gsap.utils.toArray<HTMLElement>(".parallax-frame").forEach((frame) => {
        const media = frame.querySelector<HTMLElement>(".parallax-media");
        if (!media) return;
        const amount = Number(media.dataset.parallax ?? 7);
        gsap.fromTo(
          media,
          { yPercent: -amount },
          {
            yPercent: amount,
            ease: "none",
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: 0.7 },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>(".parallax-float").forEach((element, index) => {
        gsap.to(element, {
          yPercent: index % 2 === 0 ? 6 : -6,
          ease: "none",
          scrollTrigger: { trigger: element.parentElement ?? element, start: "top bottom", end: "bottom top", scrub: 0.8 },
        });
      });

      gsap.utils.toArray<HTMLElement>(".service-card").forEach((element, index) => {
        gsap.fromTo(
          element,
          { y: 42, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: index * 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: ".services-grid", start: "top 78%", once: true },
          },
        );
      });

      gsap.to(".route-orb", { y: -25, duration: 2.8, ease: "sine.inOut", repeat: -1, yoyo: true });
    }, root);

    return () => context.revert();
  }, []);

  const goToContact = () => scrollToId("#contato");

  return (
    <div ref={root} className="site-shell overflow-x-clip bg-[#f5f1e8] text-[#202126]">
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
          <button
            onClick={() => scrollToId("#inicio")}
            className="group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f59a24]"
            aria-label="Ir para o início"
          >
            <span className="logo-plate"><img src={assets.logo} alt="Vespair Serviços Aéreos" className="h-auto w-[142px] object-contain sm:w-[162px]" /></span>
          </button>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Navegação principal">
            {navItems.map(([label, href]) => (
              <button
                key={href}
                onClick={() => scrollToId(href)}
                className="nav-link text-xs font-medium uppercase tracking-[0.14em] text-white/75 transition-colors hover:text-white"
              >
                {label}
              </button>
            ))}
            <button onClick={goToContact} className="nav-contact">
              Consulte disponibilidade <ArrowUpRight size={14} strokeWidth={1.9} />
            </button>
          </nav>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition hover:bg-white/20 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={21} />}
          </button>
        </div>
        {menuOpen && (
          <div className="mx-5 overflow-hidden rounded-2xl border border-white/15 bg-[#414042]/95 p-3 shadow-2xl backdrop-blur-xl sm:mx-8 lg:hidden">
            {navItems.map(([label, href]) => (
              <button
                key={href}
                onClick={() => {
                  scrollToId(href);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left text-sm font-medium text-white transition hover:bg-white/10"
              >
                {label} <ChevronRight size={16} />
              </button>
            ))}
            <button
              onClick={() => {
                goToContact();
                setMenuOpen(false);
              }}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4793b] px-4 py-3.5 text-xs font-bold uppercase tracking-[0.11em] text-[#414042]"
            >
              Consulte disponibilidade <ArrowUpRight size={15} />
            </button>
          </div>
        )}
      </header>

      <main>
        <section id="inicio" className="hero-scene relative isolate min-h-[760px] overflow-hidden bg-[#43160e] sm:min-h-[800px] lg:min-h-[860px]">
          <div className="hero-window absolute inset-0 overflow-hidden">
            <img src={assets.hero} alt="Aeronave executiva chegando a um hangar" className="hero-main-image absolute inset-0 h-full w-full object-cover object-[66%_center]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(65,64,66,0.97)_0%,rgba(65,64,66,0.82)_40%,rgba(244,121,59,0.25)_72%,rgba(65,64,66,0.34)_100%)]" />
            <div className="hero-orange-wash absolute inset-0 bg-[#f4793b]/18 mix-blend-color" />
            <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(65,64,66,0.72)_0%,transparent_35%,transparent_74%,rgba(65,64,66,0.24)_100%)]" />
          </div>
          <div className="hero-foreground pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="hero-door hero-door-left"><span className="hero-door-rule" /></div>
            <div className="hero-door hero-door-right"><span className="hero-door-rule" /></div>
            <div className="hero-frame absolute inset-x-5 bottom-7 top-28 border border-white/10 sm:inset-x-8 lg:inset-x-10 lg:bottom-10 lg:top-32" />
            <div className="hero-route absolute left-0 top-[52%] h-px w-[61%] bg-gradient-to-r from-transparent via-[#ffd4bd] to-transparent opacity-85" />
            <span className="route-orb absolute left-[59%] top-[calc(52%-4px)] h-2 w-2 rounded-full bg-[#ffd4bd] shadow-[0_0_0_7px_rgba(244,121,59,0.22),0_0_26px_2px_rgba(255,212,189,0.6)]" />
            <span className="hero-side-word absolute bottom-[15%] right-[-1.3rem] rotate-90 font-mono text-[9px] font-medium uppercase tracking-[0.45em] text-white/45 lg:right-[0.2rem]">Vespair · SIFQ</span>
          </div>

          <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] flex-col justify-end px-5 pb-10 pt-32 sm:min-h-[800px] sm:px-8 sm:pb-14 lg:min-h-[860px] lg:px-10 lg:pb-12">
            <div className="hero-hud absolute left-5 right-5 top-28 flex items-start justify-between text-white/55 sm:left-8 sm:right-8 lg:left-10 lg:right-10 lg:top-32">
              <span className="font-mono text-[9px] uppercase tracking-[0.18em]">Operação em solo · 24h</span>
            </div>
            <div className="relative max-w-3xl">
              <h1 className="font-display text-[clamp(3.15rem,7.4vw,7.5rem)] leading-[0.86] tracking-[-0.055em] text-[#f9f6ef]">
                <span className="hero-title-clip block overflow-hidden"><span className="hero-title-line block">Sua aeronave</span></span>
                <span className="hero-title-clip block overflow-hidden"><span className="hero-title-line block italic text-[#f8c142]">em solo.</span></span>
                <span className="hero-title-clip block overflow-hidden"><span className="hero-title-line block">Sua agenda</span></span>
                <span className="hero-title-clip block overflow-hidden"><span className="hero-title-line block">em movimento.</span></span>
              </h1>
              <p className="hero-copy mt-7 max-w-lg text-base leading-relaxed text-white/72 sm:text-lg">
                Hangaragem e atendimento aeroportuário para que você aterrisse na Serra Gaúcha com tudo pronto para seguir.
              </p>
              <div className="hero-actions mt-8 flex flex-wrap gap-3">
                <button onClick={goToContact} className="btn-copper hero-primary-action">
                  Planeje sua chegada <ArrowDownRight size={17} />
                </button>
                <button onClick={() => scrollToId("#servicos")} className="btn-ghost">
                  Conheça a estrutura
                </button>
              </div>
            </div>

              <div className="hero-meta mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-t border-white/15 pt-5 text-white/70 lg:mt-14">
              <div className="flex items-center gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20"><Plane size={14} /></span>
                <span className="font-mono text-[10px] uppercase tracking-[0.13em]">Pista: 1.022 m × 20 m</span>
              </div>
              <button onClick={() => scrollToId("#vespair")} className="group flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white hover:text-[#f8c142]">
                Role para aproximar <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 transition-transform group-hover:translate-y-1"><ArrowDownRight size={14} /></span>
              </button>
            </div>
          </div>
        </section>

        <section id="vespair" className="relative bg-[#f5f1e8] py-20 sm:py-28 lg:py-36">
          <div className="mx-auto grid max-w-[1440px] gap-14 px-5 sm:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24 lg:px-10">
            <div className="reveal-up flex flex-col justify-between">
              <div>
                <p className="eyebrow">BASE DE APOIO</p>
                <h2 className="mt-5 max-w-md font-display text-5xl leading-[0.94] tracking-[-0.045em] text-[#414042] sm:text-6xl">
                  Uma chegada bem planejada começa antes do pouso.
                </h2>
              </div>
              <div className="mt-12 hidden max-w-[250px] lg:block">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4793b]">Carta de voo</p>
                <p className="mt-3 text-sm leading-relaxed text-[#5b5750]">Uma estrutura em solo pensada para encurtar a distância entre a pista e os seus compromissos.</p>
              </div>
            </div>
            <div className="reveal-up">
              <p className="max-w-2xl text-xl leading-[1.55] text-[#35363a] sm:text-2xl">
                Localizada no Aeródromo de Flores da Cunha, a Vespair combina proteção, agilidade e hospitalidade em um único ponto de apoio para aeronaves, tripulação e passageiros.
              </p>
              <div className="mt-10 grid gap-px overflow-hidden bg-[#d8d0c2] sm:grid-cols-3">
                <div className="stat-block bg-[#f5f1e8]">
                  <span className="stat-value">500<span>m²</span></span>
                  <span className="stat-label">de área útil</span>
                </div>
                <div className="stat-block bg-[#f5f1e8]">
                  <span className="stat-value">18<span>m</span></span>
                  <span className="stat-label">de envergadura</span>
                </div>
                <div className="stat-block bg-[#f5f1e8]">
                  <span className="stat-value">24<span>h</span></span>
                  <span className="stat-label">operação e apoio</span>
                </div>
              </div>
              <div className="mt-10 flex items-center gap-4 border-l-2 border-[#f4793b] pl-5 text-sm leading-relaxed text-[#64605a]">
                <Check size={17} className="shrink-0 text-[#f4793b]" />
                <p>Atendimento para aviões com até 18 metros de envergadura.</p>
              </div>
            </div>
          </div>
        </section>

        <HangarGallery />

        <section id="servicos" className="relative overflow-hidden bg-[#202126] py-20 text-[#f5f1e8] sm:py-28 lg:py-32">
          <div className="parallax-float absolute right-0 top-0 h-full w-[48%] bg-[#414042] [clip-path:polygon(40%_0,100%_0,100%_100%,0_100%)]" />
          <div className="relative mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <div className="reveal-up flex flex-col justify-between gap-8 border-b border-white/15 pb-10 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow text-[#f8c142]">O QUE PREPARAMOS</p>
                <h2 className="mt-5 max-w-2xl font-display text-5xl leading-[0.94] tracking-[-0.045em] sm:text-6xl">Uma operação que cuida do voo antes, durante e depois da pista.</h2>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/60">Apoio em solo com a discrição de uma operação bem executada e a proximidade de quem conhece cada etapa da chegada.</p>
            </div>

            <div className="services-grid grid border-l border-white/15 sm:grid-cols-2 lg:grid-cols-4">
              {serviceCards.map((service) => {
                const Icon = service.icon;
                return (
                  <article key={service.number} className="service-card group relative min-h-[320px] border-b border-r border-white/15 p-6 sm:p-7 lg:min-h-[370px] lg:p-8">
                    <span className="font-mono text-[10px] tracking-[0.15em] text-[#f8c142]">{service.number}</span>
                    <Icon className="mt-12 text-white/75 transition duration-300 group-hover:-translate-y-1 group-hover:text-[#f8c142]" size={31} strokeWidth={1.25} />
                    <h3 className="mt-8 font-display text-3xl tracking-[-0.035em]">{service.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">{service.description}</p>
                    <span className="absolute bottom-7 right-7 text-white/25 transition duration-300 group-hover:text-[#f4793b]"><ArrowUpRight size={20} /></span>
                  </article>
                );
              })}
            </div>
            <div className="reveal-up mt-10 grid gap-px overflow-hidden border border-white/15 bg-white/10 md:grid-cols-3">
              <div className="operational-datum"><span className="font-mono text-[10px] text-[#f8c142]">01 / HANGARAGEM</span><strong>Até 18 m de envergadura</strong></div>
              <div className="operational-datum"><span className="font-mono text-[10px] text-[#f8c142]">02 / ESTRUTURA</span><strong>Mais de 500 m² de área útil</strong></div>
              <div className="operational-datum"><span className="font-mono text-[10px] text-[#f8c142]">03 / AERÓDROMO</span><strong>Operação, apoio e pista 24h</strong></div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f5f1e8] py-20 sm:py-28 lg:py-36">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-10">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
              {/* Composição Dupla: Lounge VIP Real & Bar de Apoio */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Foto 1: Lounge VIP Completo */}
                <div className="scene-image parallax-frame reveal-up relative min-h-[440px] overflow-hidden rounded-2xl bg-[#414042] sm:min-h-[560px]">
                  <img
                    src={assets.loungeCompleto}
                    alt="Lounge VIP executivo da Vespair com poltronas, mesa de reuniões, televisão e ambiente climatizado"
                    className="parallax-media absolute inset-0 h-full w-full object-cover"
                    data-parallax="7"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202126]/95 via-[#202126]/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span className="rounded bg-[#f8c142]/20 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#f8c142]">
                      INTERVALO ENTRE DESTINOS
                    </span>
                    <p className="mt-2.5 font-display text-2xl leading-tight text-white">
                      Um lugar tranquilo para a sua agenda continuar em terra.
                    </p>
                    <p className="mt-1.5 text-xs text-white/70">
                      Ambiente climatizado, Wi-Fi de alta velocidade e espaço para reuniões executivas.
                    </p>
                  </div>
                </div>

                {/* Foto 2: Espaço Bar e Café com Logo Vespair */}
                <div className="scene-image parallax-frame reveal-up relative min-h-[440px] overflow-hidden rounded-2xl bg-[#414042] sm:min-h-[560px] sm:translate-y-6">
                  <img
                    src={assets.loungeBar}
                    alt="Copa, frigobar e bar de café no Lounge VIP Vespair"
                    className="parallax-media absolute inset-0 h-full w-full object-cover"
                    data-parallax="7"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#202126]/95 via-[#202126]/25 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <span className="rounded bg-[#f4793b]/20 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#f4793b]">
                      BAR &amp; CONVENIÊNCIA
                    </span>
                    <p className="mt-2.5 font-display text-2xl leading-tight text-white">
                      Hospitalidade e conforto para passageiros e pilotos.
                    </p>
                    <p className="mt-1.5 text-xs text-white/70">
                      Café expresso, bebidas selecionadas e copa de apoio exclusiva.
                    </p>
                  </div>
                </div>
              </div>

              <div className="reveal-up flex flex-col justify-center py-4">
                <p className="eyebrow">CONVENIÊNCIA DE SOLO</p>
                <h2 className="mt-5 font-display text-5xl leading-[0.94] tracking-[-0.045em] text-[#414042] sm:text-6xl">Você desce. A Vespair segue cuidando.</h2>
                <p className="mt-7 max-w-lg text-base leading-relaxed text-[#64605a]">A estrutura foi projetada para atender os detalhes que acompanham uma aeronave: a rotina operacional, a necessidade da tripulação e o tempo de quem viaja.</p>
                <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-0 border-t border-[#d8d0c2]">
                  {serviceDetails.map((detail) => {
                    const Icon = detail.icon;
                    return (
                      <div key={detail.label} className="flex items-center gap-3 border-b border-[#d8d0c2] py-4 text-sm text-[#3f4146]">
                        <Icon size={16} strokeWidth={1.5} className="text-[#f4793b]" />
                        <span>{detail.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="reveal-up mt-12 grid gap-5 sm:grid-cols-[0.72fr_1.28fr] lg:mt-20">
              <div className="scene-image parallax-frame relative min-h-[320px] overflow-hidden rounded-2xl bg-[#414042]">
                <img
                  src={assets.aviaoPatio}
                  alt="Aeronave turboélice no pátio pavimentado em frente à fachada do Hangar Vespair"
                  className="parallax-media absolute inset-0 h-full w-full object-cover object-center"
                  data-parallax="6"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#202126]/90 via-[#202126]/15 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-white/90 font-medium">
                    Precisão em cada etapa
                  </span>
                  <span className="rounded bg-[#f4793b]/20 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#f4793b]">
                    PÁTIO VESPAIR
                  </span>
                </div>
              </div>
              <div className="relative flex min-h-[310px] flex-col justify-between overflow-hidden bg-[#e9e1d4] p-7 sm:p-9">
                <div className="parallax-float absolute right-0 top-0 h-36 w-44 bg-[#f4793b] [clip-path:polygon(100%_0,100%_100%,0_0)]" />
                <span className="relative font-mono text-[10px] uppercase tracking-[0.16em] text-[#f4793b]">ROTINA QUE LIBERA TEMPO</span>
                <p className="relative max-w-2xl font-display text-3xl leading-[1.04] tracking-[-0.035em] text-[#414042] sm:text-4xl">Do abastecimento ao transporte, os próximos movimentos podem começar aqui.</p>
                <button onClick={goToContact} className="relative mt-8 inline-flex w-fit items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#414042] transition hover:text-[#f4793b]">Fale com a operação <ArrowUpRight size={15} /></button>
              </div>
            </div>
          </div>
        </section>

        <section id="aerodromo" className="relative overflow-hidden bg-[#414042] text-[#f5f1e8]">
          <div className="mx-auto grid max-w-[1440px] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="scene-image parallax-frame reveal-up relative min-h-[540px] overflow-hidden lg:min-h-[720px]">
              <img
                src={assets.aerodromo}
                alt="Vista aérea real da pista asfaltada de 1.022m e condomínio aeronáutico Menega SIFQ em Flores da Cunha"
                className="parallax-media absolute inset-0 h-full w-full object-cover"
                data-parallax="9"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#414042]/95 via-[#414042]/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#f8c142]">COND. AERONÁUTICO MENEGA · SIFQ</p>
                <p className="mt-2 text-sm text-white/80 font-medium">Pista Asfaltada 1.022m · Cabeceira 10 · Flores da Cunha / RS</p>
              </div>
            </div>
            <div className="reveal-up flex flex-col justify-center p-7 sm:p-12 lg:p-20">
              <p className="eyebrow text-[#f8c142]">PONTO DE CHEGADA · SIFQ</p>
              <h2 className="mt-5 max-w-xl font-display text-5xl leading-[0.93] tracking-[-0.045em] sm:text-6xl">No centro da Serra. Próximo ao que importa.</h2>
              <p className="mt-7 max-w-lg text-base leading-relaxed text-white/67">O Aeródromo Condomínio Menega (SIFQ) oferece infraestrutura completa com pista asfaltada de 1.022 metros para pousos e decolagens com segurança e agilidade no coração da Serra Gaúcha.</p>

              {/* Ficha Técnica Aeronáutica da Pista */}
              <div className="mt-8 rounded-xl border border-white/15 bg-white/5 p-5 backdrop-blur-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">DADOS TÉCNICOS DA PISTA</span>
                  <span className="rounded bg-[#f4793b]/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#f4793b]">ICAO: SIFQ</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Dimensões</span>
                    <strong className="mt-0.5 block font-mono text-sm text-white font-semibold">1.022 × 20 m</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Cabeceiras</span>
                    <strong className="mt-0.5 block font-mono text-sm text-[#f8c142] font-semibold">10 / 28</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Superfície</span>
                    <strong className="mt-0.5 block font-mono text-sm text-white font-semibold">Asfalto (ASPH)</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Elevação</span>
                    <strong className="mt-0.5 block font-mono text-sm text-white font-semibold">763 m (2.503 ft)</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Operação</span>
                    <strong className="mt-0.5 block font-mono text-xs text-white font-medium">VFR Diurno / Not.</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Circuito</span>
                    <strong className="mt-0.5 block font-mono text-xs text-white font-medium">Setor E (Leste)</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Frequência</span>
                    <strong className="mt-0.5 block font-mono text-xs text-[#f8c142] font-bold">135.70 MHz</strong>
                  </div>
                  <div>
                    <span className="block font-mono text-[10px] uppercase text-white/50">Tipo</span>
                    <strong className="mt-0.5 block font-mono text-xs text-white font-medium">Privado (PRIV)</strong>
                  </div>
                </div>
              </div>

              {/* Distâncias Regionais */}
              <div className="mt-8 border-t border-white/15 pt-6">
                <span className="block font-mono text-[10px] uppercase tracking-[0.15em] text-white/50">DISTÂNCIAS TERRESTRES</span>
                <div className="mt-3 grid max-w-lg grid-cols-2 gap-x-7 gap-y-3 sm:grid-cols-3">
                  {[
                    ["Caxias do Sul", "22,5 km"],
                    ["Bento Gonçalves", "60,4 km"],
                    ["Gramado", "68,5 km"],
                    ["Vacaria", "98,6 km"],
                    ["Porto Alegre", "148 km"],
                  ].map(([city, distance]) => (
                    <div key={city}>
                      <span className="block text-[11px] text-white/55">{city}</span>
                      <span className="mt-0.5 block font-mono text-[11px] tracking-[0.08em] text-[#f8c142]">{distance}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#f4793b]" />
                  <span>Coordenadas: 29°02'44"S / 051°08'59"W</span>
                </div>
                <a
                  href="https://www.flightmarket.com.br/pt/aeroportos/SIFQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#f8c142] underline-offset-4 hover:underline"
                >
                  Consultar no FlightMarket <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>

        <RouteMap />

        <section id="contato" className="relative overflow-hidden bg-[#f5f1e8] px-5 py-20 text-[#202126] sm:px-8 sm:py-28 lg:px-10 lg:py-32">
          <div className="absolute left-0 top-0 h-1 w-full bg-[#f4793b]" />
          <div className="relative mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[1.16fr_0.84fr] lg:items-center">
            <div className="reveal-up">
              <p className="eyebrow text-[#f4793b]">PRÓXIMA APROXIMAÇÃO</p>
              <h2 className="mt-5 max-w-3xl font-display text-5xl leading-[0.92] tracking-[-0.055em] text-[#414042] sm:text-7xl">Planeje a chegada. Nós preparamos o restante.</h2>
              <p className="mt-7 max-w-xl text-base leading-relaxed text-[#4c5968] sm:text-lg">Fale com a Vespair para organizar a hangaragem e o atendimento que acompanham sua aeronave na Serra Gaúcha.</p>

              {/* Informação Operacional e Atendimento com Destaque */}
              <div className="mt-8 rounded-2xl border-2 border-[#414042]/15 bg-white p-6 shadow-md backdrop-blur-sm sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#414042]/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f4793b] text-white shadow-sm">
                      <Clock3 size={22} />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#f4793b]">
                        REGIME DE OPERAÇÃO
                      </span>
                      <h3 className="font-display text-lg font-bold text-[#202126] sm:text-xl">
                        Operação 24h <span className="text-sm font-normal text-[#5f6c7b]">(mediante agendamento prévio)</span>
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-[#f5f1e8] border border-[#f4793b]/25 p-4 sm:p-5">
                  <span className="block font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#f4793b]">
                    AGENDAMENTOS &amp; INFORMAÇÕES
                  </span>
                  <p className="mt-1.5 text-base font-bold text-[#202126] sm:text-lg leading-snug">
                    Atendimento para agendamento das 8h00min às 18h00min
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#414042] sm:text-base">
                    Fone/WhatsApp (54) 99658.8189
                  </p>
                </div>
              </div>

              {/* Links Sociais e Compartilhamento */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://instagram.com/hangarvespair"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#414042]/20 bg-white px-4 py-2.5 text-xs font-semibold text-[#414042] transition hover:border-[#f4793b] hover:text-[#f4793b] shadow-sm"
                >
                  <Instagram size={15} className="text-[#e1306c]" />
                  <span>@hangarvespair</span>
                </a>
                <a
                  href="https://maps.app.goo.gl/YV1fE6kZc2k9wQ487"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#414042]/20 bg-white px-4 py-2.5 text-xs font-semibold text-[#414042] transition hover:border-[#f4793b] hover:text-[#f4793b] shadow-sm"
                >
                  <MapPin size={15} className="text-[#4285F4]" />
                  <span>Google Maps (Meu Negócio)</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send?text=Vespair%20Servi%C3%A7os%20A%C3%A9reos%20%E2%80%94%20Hangaragem%20Executiva%20%26%20Atendimento%20no%20Aer%C3%B3dromo%20Menega%20(SIFQ)%3A%20https%3A%2F%2Fvespair.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#414042]/20 bg-white px-4 py-2.5 text-xs font-semibold text-[#414042] transition hover:border-[#25D366] hover:text-[#25D366] shadow-sm"
                >
                  <Share2 size={15} className="text-[#25D366]" />
                  <span>Compartilhar Página</span>
                </a>
              </div>
            </div>
            <div className="reveal-up contact-panel grid gap-3 bg-[#414042] p-6 sm:grid-cols-2 sm:p-8 lg:grid-cols-1">
              <p className="col-span-full font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142]">OPERAÇÃO VESPAIR · SIFQ</p>
              <a href="tel:+5554996588189" className="contact-link contact-link-inverse">54 99658.8189 <ArrowUpRight size={18} /></a>
              <a href="mailto:vespair@vespair.com.br" className="contact-link contact-link-inverse">vespair@vespair.com.br <ArrowUpRight size={18} /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#202126] px-5 py-9 text-white/55 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-6 md:flex-row md:items-end">
          <img src={assets.logo} alt="Vespair Serviços Aéreos" className="h-auto w-[150px] object-contain" />
          <p className="max-w-lg text-xs leading-relaxed md:text-right">Condomínio Aeronáutico Menega · Airport SIFQ · Hangar Vespair · Rua Via Local Municipal, 1070 · Travessão Cavour · Flores da Cunha/RS</p>
        </div>
      </footer>
    </div>
  );
}
