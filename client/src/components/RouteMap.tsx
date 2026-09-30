import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  Layers,
  MapPin,
  Navigation,
  Plane,
  Building2,
  Share2,
  Check,
  ExternalLink,
} from "lucide-react";

// Waypoints oficiais da rota de acesso exclusiva
const ROUTE_POINTS = {
  start: {
    lat: -29.0597886,
    lng: -51.1865718,
    title: "Acesso Sul / RS-122",
    description: "Trevo de entrada principal de Flores da Cunha",
    badge: "PONTO A · PARTIDA",
  },
  fiorio: {
    lat: -29.0394005,
    lng: -51.1809387,
    title: "Hotel Fiorio",
    description: "Av. 25 de Julho, 2700 · Ponto de referência e hospedagem executiva",
    badge: "PONTO B · HOTEL FIORIO",
  },
  romano: {
    lat: -29.0432145,
    lng: -51.1643011,
    title: "Parque Romano · Via Vêneto",
    description: "Corredor direto de conexão ao vale e aeródromo",
    badge: "PONTO C · PARQUE ROMANO",
  },
  dest: {
    lat: -29.0455836,
    lng: -51.149769,
    title: "Condomínio Aeronáutico Menega",
    description: "Vespair Serviços Aéreos · Hangar 12 (Pista SIFQ)",
    badge: "DESTINO · VESPAIR HANGAR 12",
  },
};

// Traçado realista do trajeto viário oficial passando pelo Hotel Fiorio e Parque Romano
const ROUTE_PATH: [number, number][] = [
  [-29.0597886, -51.1865718], // Ponto A: RS-122 / Entrada Sul
  [-29.0558, -51.1852],
  [-29.0515, -51.1840],
  [-29.0470, -51.1828],
  [-29.0430, -51.1818],
  [-29.0394005, -51.1809387], // Ponto B: Hotel Fiorio (Av. 25 de Julho, 2700)
  [-29.0398, -51.1775],
  [-29.0406, -51.1732],
  [-29.0418, -51.1685],
  [-29.0432145, -51.1643011], // Ponto C: Parque Romano (Via Vêneto)
  [-29.0425, -51.1610],
  [-29.0430, -51.1575],
  [-29.0442, -51.1540],
  [-29.0452, -51.1515],
  [-29.0455836, -51.149769], // Ponto D: Menega / Vespair Hangar 12
];

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/dir/-29.0597886,-51.1865718/Hotel+Fiorio,+Av.+25+de+Julho,+2700+-+Flores+da+Cunha,+RS,+95270-000/Parque+Romano,+Via+V%C3%AAneto+-+Flores+da+Cunha,+RS,+95270-000/-29.0455836,-51.149769/@-29.0491324,-51.1789079,15z";

const WAZE_URL =
  "https://waze.com/ul?ll=-29.0455836,-51.149769&navigate=yes";

export function RouteMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapType, setMapType] = useState<"streets" | "satellite">("streets");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    // Inicializa o mapa Leaflet centrado na rota
    const map = L.map(mapContainer.current, {
      center: [-29.0491, -51.1685],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstance.current = map;

    // Camada padrão (OpenStreetMap 100% gratuita, sem API key e sem marcas d'água)
    const streetLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }
    ).addTo(map);

    tileLayerRef.current = streetLayer;

    // Adiciona controles de zoom no canto superior direito
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    // Ícone Ponto A (Acesso Sul)
    const startIcon = L.divIcon({
      className: "custom-map-icon",
      html: `
        <div style="background:#414042;color:#fff;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2px solid #fff;font-weight:800;font-size:12px;font-family:monospace;">
          A
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Ícone Ponto B (Hotel Fiorio)
    const fiorioIcon = L.divIcon({
      className: "custom-map-icon",
      html: `
        <div style="background:#f8c142;color:#202126;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2px solid #fff;font-weight:800;font-size:12px;font-family:monospace;">
          B
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Ícone Ponto C (Parque Romano)
    const romanoIcon = L.divIcon({
      className: "custom-map-icon",
      html: `
        <div style="background:#f8c142;color:#202126;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.3);border:2px solid #fff;font-weight:800;font-size:12px;font-family:monospace;">
          C
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Ícone de destino (Vespair / Menega) com radar sonar pulsante
    const destIcon = L.divIcon({
      className: "custom-map-icon",
      html: `
        <div style="position:relative;width:40px;height:40px;display:flex;align-items:center;justify-content:center;">
          <div style="position:absolute;inset:-6px;border-radius:50%;background:#f4793b;opacity:0.35;animation:radar-pulse 2s infinite;"></div>
          <div style="background:#f4793b;color:#fff;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(244,121,59,0.6);border:2.5px solid #fff;z-index:2;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Marcadores dos 4 pontos da rota
    L.marker([ROUTE_POINTS.start.lat, ROUTE_POINTS.start.lng], { icon: startIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;padding:4px;"><span style="color:#f8c142;font-size:10px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">Ponto A · Partida</span><strong style="display:block;color:#ffffff;margin-top:2px;font-size:13px;">${ROUTE_POINTS.start.title}</strong><p style="margin:4px 0 0;font-size:12px;color:#d1d5db;">${ROUTE_POINTS.start.description}</p></div>`
      );

    L.marker([ROUTE_POINTS.fiorio.lat, ROUTE_POINTS.fiorio.lng], { icon: fiorioIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;padding:4px;"><span style="color:#f8c142;font-size:10px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">Ponto B · Hospedagem</span><strong style="display:block;color:#ffffff;margin-top:2px;font-size:13px;">${ROUTE_POINTS.fiorio.title}</strong><p style="margin:4px 0 0;font-size:12px;color:#d1d5db;">${ROUTE_POINTS.fiorio.description}</p></div>`
      );

    L.marker([ROUTE_POINTS.romano.lat, ROUTE_POINTS.romano.lng], { icon: romanoIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;padding:4px;"><span style="color:#f8c142;font-size:10px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;">Ponto C · Acesso ao Vale</span><strong style="display:block;color:#ffffff;margin-top:2px;font-size:13px;">${ROUTE_POINTS.romano.title}</strong><p style="margin:4px 0 0;font-size:12px;color:#d1d5db;">${ROUTE_POINTS.romano.description}</p></div>`
      );

    L.marker([ROUTE_POINTS.dest.lat, ROUTE_POINTS.dest.lng], { icon: destIcon })
      .addTo(map)
      .bindPopup(
        `<div style="font-family:sans-serif;padding:4px;"><span style="color:#f4793b;font-size:10px;font-family:monospace;letter-spacing:1px;text-transform:uppercase;font-weight:bold;">Destino · Hangar 12</span><strong style="display:block;color:#ffffff;font-size:14px;margin-top:2px;">${ROUTE_POINTS.dest.title}</strong><p style="margin:4px 0 0;font-size:12px;color:#f3f4f6;font-weight:600;">${ROUTE_POINTS.dest.description}</p><p style="margin:2px 0 0;font-size:11px;color:#9ca3af;">Flores da Cunha / RS · Pista SIFQ (1.022m)</p></div>`
      )
      .openPopup();

    // Linha de contorno (Glow)
    L.polyline(ROUTE_PATH, {
      color: "#f4793b",
      weight: 8,
      opacity: 0.35,
      lineCap: "round",
    }).addTo(map);

    // Linha principal da rota oficial
    L.polyline(ROUTE_PATH, {
      color: "#f4793b",
      weight: 4.5,
      opacity: 0.95,
      dashArray: "8, 8",
      lineCap: "round",
    }).addTo(map);

    // Enquadra a rota inteira na visão do mapa
    const bounds = L.latLngBounds(ROUTE_PATH);
    map.fitBounds(bounds, { padding: [45, 45] });

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Alterna entre visual de ruas e satélite
  const toggleMapType = (type: "streets" | "satellite") => {
    setMapType(type);
    if (!mapInstance.current || !tileLayerRef.current) return;

    mapInstance.current.removeLayer(tileLayerRef.current);

    if (type === "satellite") {
      const satLayer = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          maxZoom: 18,
          attribution: "Tiles &copy; Esri",
        }
      ).addTo(mapInstance.current);
      tileLayerRef.current = satLayer;
    } else {
      const streetLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }
      ).addTo(mapInstance.current);
      tileLayerRef.current = streetLayer;
    }
  };

  const handleCopyCoords = () => {
    navigator.clipboard.writeText("-29.0455836, -51.149769");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section
      id="localizacao"
      className="relative overflow-hidden bg-[#202126] px-5 py-20 text-[#f5f1e8] sm:px-8 sm:py-28 lg:px-10 lg:py-32"
    >
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#f8c142] via-[#f4793b] to-[#414042]" />

      <div className="mx-auto max-w-[1440px]">
        {/* Cabeçalho da Seção */}
        <div className="reveal-up max-w-3xl">
          <p className="eyebrow text-[#f8c142] flex items-center gap-2">
            <Compass size={14} className="text-[#f4793b]" />
            ROTA OFICIAL DE ACESSO · SIFQ
          </p>
          <h2 className="mt-5 font-display text-4xl leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl">
            Como chegar à Vespair: trajeto oficial pelo Hotel Fiorio e Parque Romano.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
            A rota terrestre oficial e recomendada conecta a entrada de Flores da Cunha (RS-122) ao
            Condomínio Aeronáutico Menega, passando pela <strong>Av. 25 de Julho (Hotel Fiorio)</strong> e
            pela <strong>Via Vêneto (Parque Romano)</strong>, garantindo acesso direto, pavimentado e seguro
            até o Hangar 12.
          </p>
        </div>

        {/* Grade com Painel de Rota e Mapa Interativo */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          {/* Card de Informações da Rota */}
          <div className="reveal-up flex flex-col justify-between rounded-2xl border border-white/10 bg-[#2b2c31] p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#f8c142]">
                  ROTA EXCLUSIVA DE ACESSO
                </span>
                <span className="rounded-full bg-[#f4793b]/20 px-3 py-1 font-mono text-[10px] font-semibold text-[#f4793b]">
                  ~7,6 km · 11 min
                </span>
              </div>

              {/* Passos da Rota */}
              <div className="mt-6 space-y-5">
                {/* Ponto A */}
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#414042] font-mono text-xs font-bold text-white border border-white/20">
                    A
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-white/50">
                      {ROUTE_POINTS.start.badge}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {ROUTE_POINTS.start.title}
                    </h4>
                    <p className="text-xs text-white/60">
                      {ROUTE_POINTS.start.description}
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-4 border-l-2 border-dashed border-white/20" />

                {/* Ponto B - Hotel Fiorio */}
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f8c142] font-mono text-xs font-bold text-[#202126]">
                    B
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#f8c142]">
                      {ROUTE_POINTS.fiorio.badge}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {ROUTE_POINTS.fiorio.title}
                    </h4>
                    <p className="text-xs text-white/60">
                      {ROUTE_POINTS.fiorio.description}
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-4 border-l-2 border-dashed border-white/20" />

                {/* Ponto C - Parque Romano */}
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f8c142] font-mono text-xs font-bold text-[#202126]">
                    C
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#f8c142]">
                      {ROUTE_POINTS.romano.badge}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {ROUTE_POINTS.romano.title}
                    </h4>
                    <p className="text-xs text-white/60">
                      {ROUTE_POINTS.romano.description}
                    </p>
                  </div>
                </div>

                <div className="ml-4 h-4 border-l-2 border-dashed border-[#f4793b]/40" />

                {/* Ponto D - Destino */}
                <div className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f4793b] text-white shadow-[0_0_15px_rgba(244,121,59,0.5)]">
                    <Plane size={16} />
                  </div>
                  <div>
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[#f4793b] font-bold">
                      {ROUTE_POINTS.dest.badge}
                    </span>
                    <h4 className="text-base font-bold text-white">
                      {ROUTE_POINTS.dest.title}
                    </h4>
                    <p className="text-xs text-white/80 font-medium">
                      {ROUTE_POINTS.dest.description}
                    </p>
                    <p className="mt-1 text-[11px] text-white/50">
                      Rua Via Local Municipal, 1070 · Travessão Cavour · Flores da Cunha / RS
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Técnicas da Pista SIFQ */}
              <div className="mt-8 rounded-xl border border-white/10 bg-[#202126] p-4">
                <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-mono">
                      Pista / ICAO
                    </span>
                    <span className="font-mono text-white text-[11px] font-semibold">
                      1.022 × 20 m · SIFQ
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-mono">
                      Cabeceiras / Piso
                    </span>
                    <span className="font-mono text-[#f8c142] text-[11px] font-semibold">
                      10/28 · Asfalto
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-mono">
                      Elevação
                    </span>
                    <span className="font-mono text-white text-[11px]">
                      763 m (2.503 ft)
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-white/50 uppercase font-mono">
                      Frequência ATIS
                    </span>
                    <span className="font-mono text-[#f8c142] text-[11px] font-bold">
                      135.70 MHz
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações de Navegação e GPS */}
            <div className="mt-8 space-y-3 pt-6 border-t border-white/10">
              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={GOOGLE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-[#f4793b] px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#e0682b] active:scale-[0.98]"
                >
                  <Navigation size={15} />
                  Abrir no Google Maps
                </a>
                <a
                  href={WAZE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/10 active:scale-[0.98]"
                >
                  <ExternalLink size={15} />
                  Navegar com Waze
                </a>
              </div>

              <button
                type="button"
                onClick={handleCopyCoords}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent py-2.5 font-mono text-[11px] text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-[#25D366]" />
                    <span>Coordenadas copiadas para a área de transferência!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={13} />
                    <span>Copiar Coordenadas GPS (-29.04558, -51.14976)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Container do Mapa Interativo */}
          <div className="reveal-up relative min-h-[440px] overflow-hidden rounded-2xl border border-white/15 bg-[#1a1a1e] shadow-2xl lg:min-h-[560px]">
            {/* Controles do Tipo de Mapa */}
            <div className="absolute left-4 top-4 z-[1000] flex gap-1 rounded-lg border border-white/15 bg-[#202126]/90 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => toggleMapType("streets")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition ${
                  mapType === "streets"
                    ? "bg-[#f4793b] text-white font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <MapPin size={13} />
                Mapa
              </button>
              <button
                type="button"
                onClick={() => toggleMapType("satellite")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs transition ${
                  mapType === "satellite"
                    ? "bg-[#f4793b] text-white font-semibold"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Layers size={13} />
                Satélite
              </button>
            </div>

            {/* Badge de Dica Interativa */}
            <div className="absolute bottom-4 left-4 z-[1000] hidden sm:block rounded-full bg-[#202126]/85 px-3 py-1 text-[10px] font-mono text-white/70 backdrop-blur-md border border-white/10">
              💡 Rota oficial de acesso passando pelo Hotel Fiorio e Parque Romano
            </div>

            {/* Elemento do Mapa Leaflet */}
            <div ref={mapContainer} className="h-full w-full min-h-[440px] lg:min-h-[560px]" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default RouteMap;
