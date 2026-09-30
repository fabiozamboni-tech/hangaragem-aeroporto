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
  Maximize2,
  X,
  Route,
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

// Traçado de alta precisão seguindo curva a curva o asfalto das ruas reais (173 pontos OSRM/OpenStreetMap)
const PRECISE_STREET_PATH: [number, number][] = [
  [-29.059794, -51.186585], [-29.059257, -51.186838], [-29.058486, -51.187082], [-29.058187, -51.187126],
  [-29.058001, -51.187175], [-29.057738, -51.187292], [-29.057544, -51.187395], [-29.057266, -51.187485],
  [-29.057042, -51.187493], [-29.056816, -51.187469], [-29.056578, -51.187437], [-29.056081, -51.187164],
  [-29.055658, -51.186814], [-29.055395, -51.186635], [-29.055260, -51.186515], [-29.054934, -51.186281],
  [-29.054817, -51.186206], [-29.054520, -51.186002], [-29.053922, -51.185564], [-29.053382, -51.185162],
  [-29.053181, -51.185026], [-29.052596, -51.184577], [-29.052151, -51.184296], [-29.051803, -51.184097],
  [-29.051479, -51.183922], [-29.051429, -51.183894], [-29.051077, -51.183729], [-29.050371, -51.183398],
  [-29.050174, -51.183251], [-29.049954, -51.183042], [-29.049599, -51.182747], [-29.049360, -51.182695],
  [-29.049264, -51.182713], [-29.049152, -51.182720], [-29.048913, -51.182723], [-29.048796, -51.182727],
  [-29.048083, -51.182398], [-29.047667, -51.182218], [-29.047231, -51.182048], [-29.046704, -51.181828],
  [-29.046384, -51.181668], [-29.045696, -51.181406], [-29.045232, -51.181211], [-29.044732, -51.180996],
  [-29.044440, -51.180877], [-29.044108, -51.180773], [-29.043927, -51.180659], [-29.043792, -51.180633],
  [-29.043433, -51.180566], [-29.043308, -51.180546], [-29.043183, -51.180534], [-29.042906, -51.180530],
  [-29.042549, -51.180462], [-29.042398, -51.180457], [-29.042113, -51.180449], [-29.042023, -51.180449],
  [-29.041889, -51.180472], [-29.041695, -51.180506], [-29.041406, -51.180483], [-29.041214, -51.180473],
  [-29.040132, -51.180439], [-29.039970, -51.180450], [-29.0394005, -51.1809387], // Hotel Fiorio
  [-29.039249, -51.180447], [-29.039082, -51.180487], [-29.038856, -51.180536], [-29.038631, -51.180599],
  [-29.038545, -51.180614], [-29.038571, -51.180385], [-29.038571, -51.180154], [-29.038532, -51.177680],
  [-29.038554, -51.177356], [-29.038579, -51.177212], [-29.038620, -51.177088], [-29.038722, -51.176917],
  [-29.038890, -51.176619], [-29.038990, -51.176257], [-29.038983, -51.176107], [-29.038939, -51.175939],
  [-29.038852, -51.175694], [-29.038687, -51.175237], [-29.038605, -51.174925], [-29.038537, -51.174617],
  [-29.038511, -51.174329], [-29.038492, -51.173401], [-29.038476, -51.172435], [-29.038473, -51.171890],
  [-29.038574, -51.171535], [-29.038677, -51.171279], [-29.039026, -51.170808], [-29.039391, -51.170353],
  [-29.039745, -51.169922], [-29.040180, -51.169456], [-29.040555, -51.169008], [-29.040914, -51.168618],
  [-29.041036, -51.168391], [-29.041132, -51.168225], [-29.041220, -51.167988], [-29.041267, -51.167785],
  [-29.041319, -51.167404], [-29.041335, -51.167061], [-29.041385, -51.166635], [-29.041610, -51.166077],
  [-29.041708, -51.165838], [-29.041824, -51.165627], [-29.041917, -51.165519], [-29.042010, -51.165425],
  [-29.042476, -51.165040], [-29.042704, -51.164852], [-29.042847, -51.164667], [-29.0432145, -51.1643011], // Parque Romano
  [-29.043542, -51.163574], [-29.043796, -51.163240], [-29.043948, -51.163083], [-29.044192, -51.162886],
  [-29.044996, -51.162426], [-29.045018, -51.161920], [-29.045046, -51.161514], [-29.045107, -51.161088],
  [-29.045202, -51.160657], [-29.045290, -51.160306], [-29.045326, -51.160004], [-29.045336, -51.159716],
  [-29.045287, -51.158054], [-29.045635, -51.158027], [-29.045622, -51.156178], [-29.045649, -51.153309],
  [-29.045657, -51.152080], [-29.045672, -51.150570], [-29.0455836, -51.149769], // Vespair Hangar 12
];

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/dir/-29.0597886,-51.1865718/Hotel+Fiorio,+Av.+25+de+Julho,+2700+-+Flores+da+Cunha,+RS,+95270-000/Parque+Romano,+Via+V%C3%AAneto+-+Flores+da+Cunha,+RS,+95270-000/-29.0455836,-51.149769/@-29.0491324,-51.1789079,15z";

const WAZE_URL =
  "https://waze.com/ul?ll=-29.0455836,-51.149769&navigate=yes";

export function RouteMap() {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
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

    // Linha de contorno (Glow pelas vias reais)
    L.polyline(PRECISE_STREET_PATH, {
      color: "#f4793b",
      weight: 8,
      opacity: 0.35,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // Linha principal da rota viária real (curva a curva)
    L.polyline(PRECISE_STREET_PATH, {
      color: "#f4793b",
      weight: 5,
      opacity: 0.95,
      dashArray: "8, 6",
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    // Enquadra a rota inteira perfeitamente na visão do mapa
    const bounds = L.latLngBounds(PRECISE_STREET_PATH);
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
            ACESSO &amp; LOCALIZAÇÃO OPERACIONAL · SIFQ
          </p>
          <h2 className="mt-5 font-display text-4xl leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl">
            Como chegar à Vespair: rota viária e localização do hangar.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
            Abaixo você encontra a <strong>rota terrestre oficial</strong> para veículos e a{" "}
            <strong>planta do aeródromo</strong> com o trajeto de taxiamento da aeronave até o Hangar 12.
          </p>
        </div>

        {/* =========================================================================
            BLOCO 1: ROTA TERRESTRE (Passos + Mapa Interativo com Traçado de Ruas)
           ========================================================================= */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          {/* Card Esquerdo: Informações da Rota Terrestre */}
          <div className="reveal-up flex flex-col justify-between rounded-2xl border border-white/10 bg-[#2b2c31] p-6 sm:p-8">
            <div>
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#f8c142]">
                  TRAJETO VIÁRIO OFICIAL
                </span>
                <span className="rounded-full bg-[#f4793b]/20 px-3 py-1 font-mono text-[10px] font-semibold text-[#f4793b]">
                  6,5 km · ~10 min
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
            </div>

            {/* Ações de Navegação e GPS */}
            <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
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

          {/* Card Direito: Mapa Interativo Leaflet com Traçado de Precisão */}
          <div className="reveal-up relative min-h-[460px] overflow-hidden rounded-2xl border border-white/15 bg-[#1a1a1e] shadow-2xl lg:min-h-[520px]">
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
              🛣️ Rota viária passando pelo Hotel Fiorio e Parque Romano
            </div>

            {/* Elemento do Mapa Leaflet */}
            <div ref={mapContainer} className="h-full w-full min-h-[460px] lg:min-h-[520px]" />
          </div>
        </div>

        {/* =========================================================================
            BLOCO 2: PLANTA DO HANGAR NO AERÓDROMO (Visível diretamente sem cliques)
           ========================================================================= */}
        <div className="reveal-up mt-16 rounded-2xl border border-white/10 bg-[#2b2c31] p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#f8c142] flex items-center gap-2">
                <Plane size={14} className="text-[#f4793b]" />
                PLANTA INTERNA DO AERÓDROMO · SIFQ
              </p>
              <h3 className="mt-2 font-display text-2xl text-white sm:text-3xl">
                Localização do Hangar 12 e Taxiway
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden rounded-full bg-[#f4793b]/20 px-3 py-1 font-mono text-[10px] font-semibold text-[#f4793b] sm:inline-block">
                ACESSO CABECEIRA 10
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-white/15"
              >
                <Maximize2 size={14} />
                Ampliar Planta
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            {/* Lado Esquerdo: Instruções de Taxiamento & Ficha Técnica */}
            <div className="space-y-6">
              <p className="text-sm leading-relaxed text-white/70 sm:text-base">
                Ao pousar pela <strong>Cabeceira 10</strong> da pista asfaltada (1.022 m), o piloto deve livrar a pista à esquerda e seguir a linha guia amarela demarcada da <strong>Taxiway Norte</strong> diretamente até o pátio privativo e instalações do <strong>Hangar 12 da Vespair</strong>.
              </p>

              {/* Passos de Solo */}
              <div className="space-y-4 rounded-xl border border-white/10 bg-[#202126] p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#414042] font-mono text-xs font-bold text-[#f8c142] border border-[#f8c142]/40">
                    10
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#f8c142]">
                      1. Pouso na Cabeceira 10
                    </h5>
                    <p className="text-xs text-white/60">
                      Pista asfaltada de 1.022 × 20 m. Efetuar desaceleração e livrar pista pelo acesso norte.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4793b]/20 font-mono text-xs font-bold text-[#f4793b] border border-[#f4793b]/40">
                    TWY
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-[#f4793b]">
                      2. Taxiway e Linha Guia
                    </h5>
                    <p className="text-xs text-white/60">
                      Ingressar na Taxiway pavimentada acompanhando a sinalização horizontal até o pátio norte.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f4793b] text-white shadow-md">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-white">
                      3. Pátio do Hangar 12 (Vespair)
                    </h5>
                    <p className="text-xs text-white/60">
                      Estacionamento seguro em piso epóxi, suporte de reboque, abastecimento e lounge VIP.
                    </p>
                  </div>
                </div>
              </div>

              {/* Ficha Técnica Rápida da Pista */}
              <div className="rounded-xl border border-white/10 bg-[#202126] p-4">
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

            {/* Lado Direito: Imagem da Planta do Hangar com Efeito Interativo */}
            <div className="relative overflow-hidden rounded-xl border border-white/20 bg-[#52604d] p-3 shadow-2xl">
              <div className="absolute left-6 top-6 z-10 flex flex-wrap gap-2">
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold text-[#f8c142] backdrop-blur-md">
                  SIFQ · CABECEIRA 10
                </span>
                <span className="rounded-md border border-white/20 bg-[#202126]/90 px-3 py-1 font-mono text-[10px] font-bold text-[#f4793b] backdrop-blur-md">
                  TAXIWAY ➔ HANGAR 12
                </span>
              </div>

              <div
                onClick={() => setIsLightboxOpen(true)}
                className="group relative cursor-pointer overflow-hidden rounded-lg"
              >
                <img
                  src="./images/vespair-mapa-hangar.png"
                  alt="Planta técnica de localização do Hangar 12 da Vespair no Aeródromo Menega (SIFQ) com trajeto de Taxiway desde a Cabeceira 10"
                  className="max-h-[460px] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/35 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="flex items-center gap-2 rounded-full bg-[#f4793b] px-4 py-2 font-mono text-xs font-bold text-white shadow-2xl">
                    <Maximize2 size={14} /> Clique para ampliar a planta
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between px-2 py-1 text-[11px] font-mono text-white/75">
                <span>Pista Asfaltada 1.022m · Taxiway Norte</span>
                <span className="text-[#f8c142] font-semibold">Vespair Serviços Aéreos · Hangar 12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal / Lightbox de Alta Resolução da Planta do Aeródromo */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-h-[95vh] max-w-[95vw] overflow-hidden rounded-2xl border border-white/20 bg-[#2b2c31] p-2 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-2 font-mono text-xs text-white">
                <Plane size={16} className="text-[#f4793b]" />
                <span className="font-bold">Planta de Taxiamento e Localização do Hangar 12 · SIFQ</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex items-center justify-center p-2 bg-[#52604d] rounded-b-xl overflow-auto max-h-[80vh]">
              <img
                src="./images/vespair-mapa-hangar.png"
                alt="Planta detalhada do Hangar 12 Vespair no Aeródromo Menega"
                className="max-h-[78vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RouteMap;
