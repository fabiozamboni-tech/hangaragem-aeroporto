import { useState } from "react";
import { Share2, MessageCircle, Instagram, MapPin, X } from "lucide-react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  phoneNumber = "5554996588180",
  defaultMessage = "Olá! Gostaria de mais informações sobre os serviços de hangaragem e atendimento da Vespair.",
}: WhatsAppButtonProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappChatUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  
  const shareText = encodeURIComponent(
    "Vespair Serviços Aéreos — Hangaragem Executiva & Atendimento no Aeródromo Menega (SIFQ) em Flores da Cunha/RS:\nhttps://vespair.com.br"
  );
  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <aside
      aria-label="Atendimento e Compartilhamento"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end sm:bottom-6 sm:right-6 pointer-events-none"
    >
      <div className="relative flex flex-col items-end group pointer-events-auto">
        {/* Menu Flutuante Expandido com Opções Rápidas */}
        {isMenuOpen && (
          <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-white/20 bg-[#202126]/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200 min-w-[240px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 px-1">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#f8c142]">
                ATENDIMENTO &amp; REDES
              </span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-full p-1 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Fechar menu de contato"
              >
                <X size={14} />
              </button>
            </div>

            {/* Opção 1: Iniciar Conversa no WhatsApp */}
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl bg-[#25D366]/15 p-2.5 text-xs font-semibold text-[#25D366] transition hover:bg-[#25D366] hover:text-white"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#25D366] text-white">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span>Conversar no WhatsApp</span>
                <span className="font-mono text-[10px] opacity-80">54 99658.8180</span>
              </div>
            </a>

            {/* Opção 2: Compartilhar no WhatsApp */}
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f4793b] text-white">
                <Share2 size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span>Compartilhar Página</span>
                <span className="font-mono text-[10px] text-white/60">Enviar link no WhatsApp</span>
              </div>
            </a>

            {/* Opção 3: Instagram */}
            <a
              href="https://instagram.com/hangarvespair"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-semibold text-white transition hover:bg-gradient-to-r hover:from-[#833ab4]/40 hover:via-[#fd1d1d]/40 hover:to-[#fcb045]/40"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-[#fd1d1d] via-[#e1306c] to-[#833ab4] text-white">
                <Instagram size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span>Instagram</span>
                <span className="font-mono text-[10px] text-white/60">@hangarvespair</span>
              </div>
            </a>

            {/* Opção 4: Google Maps (Meu Negócio) */}
            <a
              href="https://maps.app.goo.gl/YV1fE6kZc2k9wQ487"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#4285F4] text-white">
                <MapPin size={14} />
              </div>
              <div className="flex flex-col text-left">
                <span>Google Maps</span>
                <span className="font-mono text-[10px] text-white/60">Perfil da Empresa</span>
              </div>
            </a>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Tooltip informativo discreto */}
          {!isMenuOpen && (
            <div
              className={`whitespace-nowrap rounded-full bg-[#202126]/95 px-4 py-2 text-xs font-medium tracking-wide text-white shadow-lg backdrop-blur-md transition-all duration-300 border border-white/10 ${
                isHovered
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 translate-x-2 pointer-events-none"
              }`}
              role="tooltip"
            >
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse" />
                <span>Atendimento &amp; Compartilhar</span>
              </div>
            </div>
          )}

          {/* Botão Flutuante Principal (Ícone WhatsApp Oficial com proporções exatas) */}
          <a
            href={whatsappChatUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Atendimento via WhatsApp Vespair"
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.6)] active:scale-95 sm:h-15 sm:w-15 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
          >
            {/* Ícone oficial e exato do WhatsApp (viewBox 0 0 24 24) */}
            <svg
              className="h-7 w-7 fill-white drop-shadow transition-transform duration-300 group-hover:scale-105 sm:h-8 sm:w-8"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
            </svg>
          </a>

          {/* Botão de Abrir Opções de Compartilhar e Redes */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Abrir menu de compartilhamento e redes"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#202126]/90 text-white shadow-lg backdrop-blur-md transition hover:bg-[#f4793b] hover:scale-105 active:scale-95"
          >
            {isMenuOpen ? <X size={15} /> : <Share2 size={15} />}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default WhatsAppButton;
