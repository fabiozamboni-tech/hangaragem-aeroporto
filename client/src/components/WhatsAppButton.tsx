import { useState } from "react";

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export function WhatsAppButton({
  phoneNumber = "5554996588180",
  defaultMessage = "Olá! Gostaria de mais informações sobre os serviços de hangaragem e atendimento da Vespair.",
}: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const encodedMessage = encodeURIComponent(defaultMessage);
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

  return (
    <aside
      aria-label="Atendimento via WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-end sm:bottom-6 sm:right-6 pointer-events-none"
    >
      <div className="relative flex items-center group pointer-events-auto">
        {/* Tooltip informativo discreto ao passar o mouse */}
        <div
          className={`absolute right-[calc(100%+14px)] whitespace-nowrap rounded-full bg-[#202126]/95 px-4 py-2 text-xs font-medium tracking-wide text-white shadow-lg backdrop-blur-md transition-all duration-300 border border-white/10 ${
            isHovered
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-2 pointer-events-none"
          }`}
          role="tooltip"
        >
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366] animate-pulse" />
            <span>Atendimento Online · SIFQ</span>
          </div>
          {/* Seta do tooltip */}
          <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 border-y-4 border-y-transparent border-l-[6px] border-l-[#202126]/95" />
        </div>

        {/* Efeito de sinal de Radar (Ondas concêntricas de sonar) */}
        <div className="absolute inset-0 -m-1 pointer-events-none flex items-center justify-center">
          {/* Anel Radar 1 */}
          <span className="radar-wave radar-wave-1 absolute h-full w-full rounded-full border border-[#25D366] opacity-0" />
          {/* Anel Radar 2 */}
          <span className="radar-wave radar-wave-2 absolute h-full w-full rounded-full border border-[#25D366] opacity-0" />
          {/* Anel Radar 3 */}
          <span className="radar-wave radar-wave-3 absolute h-full w-full rounded-full border border-[#f4793b]/50 opacity-0" />
        </div>

        {/* Botão flutuante principal */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Iniciar conversa no WhatsApp com a equipe da Vespair"
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_25px_rgba(37,211,102,0.35)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_32px_rgba(37,211,102,0.5)] active:scale-95 sm:h-15 sm:w-15 focus:outline-none focus:ring-4 focus:ring-[#25D366]/40"
        >
          {/* Varredura sutil de radar no próprio botão */}
          <span className="radar-sweep absolute inset-0 rounded-full overflow-hidden pointer-events-none opacity-20">
            <span className="block h-full w-full bg-gradient-to-tr from-transparent via-white to-transparent" />
          </span>

          {/* Ícone oficial do WhatsApp vetorizado */}
          <svg
            className="relative h-7 w-7 fill-current drop-shadow-sm transition-transform duration-300 group-hover:rotate-6 sm:h-8 sm:w-8"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M17.507 14.307l-.009.075c-2.399-1.2-2.823-1.077-3.08-.857-.282.241-.78 1.01-.954 1.205-.174.195-.348.219-.64.073-.292-.146-1.233-.455-2.35-1.45-.867-.775-1.452-1.733-1.624-2.025-.172-.293-.018-.451.127-.597.132-.132.293-.341.439-.512.146-.171.195-.292.293-.487.098-.195.049-.365-.024-.512-.073-.146-.658-1.584-.902-2.17-.238-.57-.48-.493-.658-.502-.17-.008-.365-.01-.56-.01-.195 0-.512.073-.78.365-.268.292-1.024 1.001-1.024 2.441 0 1.439 1.048 2.83 1.195 3.025.146.195 2.062 3.15 4.996 4.416.698.301 1.244.482 1.669.617.702.223 1.341.192 1.847.116.564-.085 1.731-.708 1.975-1.391.244-.683.244-1.269.171-1.391-.073-.122-.268-.195-.56-.341zm-5.467 7.643h-.008a10.02 10.02 0 01-5.116-1.395l-.367-.218-3.799.996 1.014-3.702-.239-.38a10.038 10.038 0 01-1.54-5.32c0-5.545 4.512-10.058 10.063-10.058 2.687 0 5.213 1.047 7.114 2.95 1.9 1.902 2.946 4.43 2.944 7.12-.003 5.546-4.516 10.057-10.066 10.057zm8.53-15.65A12.016 12.016 0 0012.035 2.75C5.408 2.75.012 8.146.01 14.773a11.97 11.97 0 001.836 6.368L0 27.25l6.287-1.648a11.987 11.987 0 005.744 1.468h.005c6.626 0 12.023-5.396 12.026-12.024a11.956 11.956 0 00-3.522-8.546z" />
          </svg>
        </a>
      </div>
    </aside>
  );
}

export default WhatsAppButton;
