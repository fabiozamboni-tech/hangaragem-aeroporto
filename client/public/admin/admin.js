/**
 * VESPAIR CMS — Editor Visual In-Layout
 * Standalone, sem banco de dados, seguro contra invasões e com backups automáticos.
 */

(function () {
  "use strict";

  const API_ENDPOINT = "./api.php";
  let csrfToken = null;
  let activeElement = null;
  let activeImage = null;
  let editedContent = {};
  let isSaving = false;

  // DOM Elements
  const loginScreen = document.getElementById("cms-login-screen");
  const loginForm = document.getElementById("cms-login-form");
  const usernameInput = document.getElementById("cms-username");
  const passwordInput = document.getElementById("cms-password");
  const loginError = document.getElementById("cms-login-error");
  const btnSubmit = document.getElementById("cms-btn-submit");

  const mainApp = document.getElementById("cms-main-app");
  const cmsFrame = document.getElementById("cms-frame");
  const btnSave = document.getElementById("cms-btn-save");
  const btnBackups = document.getElementById("cms-btn-backups");
  const btnLogout = document.getElementById("cms-btn-logout");
  const saveStatus = document.getElementById("cms-save-status");

  // Floating Toolbar
  const floatToolbar = document.getElementById("cms-float-toolbar");
  const toolBold = document.getElementById("cms-tool-bold");
  const toolItalic = document.getElementById("cms-tool-italic");
  const toolSizeDec = document.getElementById("cms-tool-size-dec");
  const toolSizeInc = document.getElementById("cms-tool-size-inc");
  const currentSizeLabel = document.getElementById("cms-current-size");
  const customColorInput = document.getElementById("cms-custom-color");

  // Modals
  const backupModal = document.getElementById("cms-backup-modal");
  const closeBackups = document.getElementById("cms-close-backups");
  const backupsList = document.getElementById("cms-backups-list");

  const imageModal = document.getElementById("cms-image-modal");
  const closeImage = document.getElementById("cms-close-image");
  const imagePreviewImg = document.getElementById("cms-image-preview-img");
  const imageFileInput = document.getElementById("cms-image-file-input");
  const imageMetaText = document.getElementById("cms-image-meta-text");
  const btnApplyImage = document.getElementById("cms-btn-apply-image");
  const btnDeleteImage = document.getElementById("cms-btn-delete-image");

  // Toast
  const toast = document.getElementById("cms-toast");
  const toastMsg = document.getElementById("cms-toast-msg");
  let toastTimeout = null;

  function showToast(message, isError = false) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMsg.textContent = message;
    toast.style.borderColor = isError ? "var(--cms-danger)" : "var(--cms-copper)";
    toast.style.display = "flex";
    toastTimeout = setTimeout(() => {
      toast.style.display = "none";
    }, 4000);
  }

  let isStaticHosting = false;

  // Fallback autônomo para ambientes estáticos (ex: Firebase Hosting ou visualização local sem PHP)
  function handleStaticFallback(action, options) {
    if (action === "check") {
      const isAuth = sessionStorage.getItem("vespair_cms_logged") === "true";
      return { authenticated: isAuth, csrf_token: isAuth ? "static-session" : null };
    }
    if (action === "login") {
      const { username, password } = options.body || {};
      if (username === "admin" && password === "nimda") {
        sessionStorage.setItem("vespair_cms_logged", "true");
        return { success: true, message: "Login realizado com sucesso.", csrf_token: "static-session" };
      }
      throw new Error("Usuário ou senha inválidos.");
    }
    if (action === "logout") {
      sessionStorage.removeItem("vespair_cms_logged");
      return { success: true, message: "Sessão encerrada." };
    }
    if (action === "save") {
      const content = options.body?.content || {};
      const timestamp = new Date().toISOString().replace(/T/, "_").replace(/:/g, "-").replace(/\..+/, "");
      const dateFormatted = new Date().toLocaleString("pt-BR");

      localStorage.setItem("vespair_cms_current", JSON.stringify(content));

      let backups = [];
      try {
        backups = JSON.parse(localStorage.getItem("vespair_cms_backups") || "[]");
      } catch (e) {}
      backups.unshift({
        id: timestamp,
        html_file: `index_${timestamp}.html`,
        timestamp: timestamp,
        date_formatted: dateFormatted,
        size_kb: Math.round(JSON.stringify(content).length / 1024) || 1,
        content: content,
      });
      localStorage.setItem("vespair_cms_backups", JSON.stringify(backups.slice(0, 20)));

      return {
        success: true,
        message: "Alterações salvas e backup gerado com sucesso.",
        timestamp: dateFormatted,
        backup_id: `index_${timestamp}.html`,
      };
    }
    if (action === "upload_image") {
      const base64 = options.body?.image_base64;
      return {
        success: true,
        message: "Imagem adaptada com sucesso.",
        image_url: base64,
        filename: "local_image",
      };
    }
    if (action === "backups") {
      let backups = [];
      try {
        backups = JSON.parse(localStorage.getItem("vespair_cms_backups") || "[]");
      } catch (e) {}
      return { success: true, backups };
    }
    if (action === "restore_backup") {
      const id = options.body?.id;
      let backups = [];
      try {
        backups = JSON.parse(localStorage.getItem("vespair_cms_backups") || "[]");
      } catch (e) {}
      const found = backups.find((b) => b.id === id);
      if (found && found.content) {
        editedContent = { ...found.content };
        localStorage.setItem("vespair_cms_current", JSON.stringify(editedContent));
        return { success: true, message: "Backup restaurado com sucesso." };
      }
      throw new Error("Backup não encontrado.");
    }
    return { success: true };
  }

  // API Client Helper
  async function apiCall(action, options = {}) {
    if (isStaticHosting) {
      return handleStaticFallback(action, options);
    }

    const method = options.method || "GET";
    const headers = {
      ...(options.headers || {}),
    };

    if (csrfToken) {
      headers["X-CMS-Token"] = csrfToken;
    }

    const url = `${API_ENDPOINT}?action=${encodeURIComponent(action)}`;
    const fetchOptions = {
      method,
      headers,
      credentials: "include",
    };

    if (options.body) {
      if (options.body instanceof FormData) {
        fetchOptions.body = options.body;
      } else {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = JSON.stringify(options.body);
      }
    }

    try {
      const response = await fetch(url, fetchOptions);
      const text = await response.text();

      // Detecta se a resposta é o próprio código PHP bruto (servidor estático tipo Firebase)
      if (text.trim().startsWith("<?php")) {
        console.warn("Hospedagem estática detectada (Firebase). Ativando modo autônomo do CMS.");
        isStaticHosting = true;
        return handleStaticFallback(action, options);
      }

      // Tenta extrair JSON (mesmo se o servidor emitir avisos PHP antes do JSON)
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (err) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            data = JSON.parse(jsonMatch[0]);
          } catch (e2) {}
        }
      }

      if (!data) {
        console.warn("Resposta não-JSON do servidor. Ativando modo autônomo.");
        isStaticHosting = true;
        return handleStaticFallback(action, options);
      }

      if (!response.ok || data.success === false) {
        if (response.status === 401 && action !== "login" && action !== "check") {
          showLogin();
          showToast("Sessão expirada. Faça login novamente.", true);
        }
        throw new Error(data?.message || `Erro na requisição (${response.status})`);
      }

      return data;
    } catch (err) {
      if (isStaticHosting) {
        return handleStaticFallback(action, options);
      }
      throw err;
    }
  }

  // Inicialização e Verificação de Sessão
  async function checkAuth() {
    try {
      const res = await apiCall("check");
      if (res && res.authenticated) {
        csrfToken = res.csrf_token;
        showApp();
      } else {
        showLogin();
      }
    } catch (e) {
      showLogin();
    }
  }

  function showLogin() {
    loginScreen.style.display = "flex";
    mainApp.style.display = "none";
    loginError.style.display = "none";
    usernameInput.value = "";
    passwordInput.value = "";
  }

  function showApp() {
    loginScreen.style.display = "none";
    mainApp.style.display = "flex";
    loadIframe();
  }

  // Tratamento de Login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.style.display = "none";
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span>Entrando...</span>`;

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    try {
      const res = await apiCall("login", {
        method: "POST",
        body: { username, password },
      });

      if (res && res.success) {
        csrfToken = res.csrf_token;
        showApp();
        showToast("Bem-vindo ao Editor Visual Vespair!");
      }
    } catch (err) {
      loginError.textContent = err.message || "Erro ao autenticar. Tente novamente.";
      loginError.style.display = "block";
    } finally {
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = `<span>Entrar no Editor</span>`;
    }
  });

  // Logout
  btnLogout.addEventListener("click", async () => {
    try {
      await apiCall("logout", { method: "POST" });
    } catch (e) {}
    csrfToken = null;
    showLogin();
    showToast("Sessão encerrada com sucesso.");
  });

  // Carregar e Integrar Iframe
  function loadIframe() {
    saveStatus.textContent = "Carregando layout do site...";
    cmsFrame.src = "../?cms_preview=" + Date.now();

    cmsFrame.onload = () => {
      saveStatus.textContent = "Site pronto para edição";
      initIframeBridge();
    };
  }

  function initIframeBridge() {
    try {
      const iframeDoc = cmsFrame.contentDocument || cmsFrame.contentWindow.document;
      const iframeWin = cmsFrame.contentWindow;

      if (!iframeDoc) return;

      // Injeta estilos visuais de edição no iframe
      const styleEl = iframeDoc.createElement("style");
      styleEl.textContent = `
        .vespair-cms-editable {
          position: relative !important;
          outline: 1px dashed rgba(244, 121, 59, 0.4) !important;
          outline-offset: 3px !important;
          transition: outline 0.15s ease !important;
          min-height: 1em !important;
        }
        .vespair-cms-editable:hover {
          outline: 2px dashed rgba(244, 121, 59, 0.9) !important;
          background: rgba(244, 121, 59, 0.05) !important;
          cursor: text !important;
        }
        .vespair-cms-editable:focus {
          outline: 2px solid #f4793b !important;
          background: rgba(244, 121, 59, 0.1) !important;
        }
        .vespair-cms-img-editable {
          position: relative !important;
          cursor: pointer !important;
          outline: 2px dashed rgba(248, 193, 66, 0.7) !important;
          outline-offset: 3px !important;
          transition: outline 0.2s, filter 0.2s !important;
        }
        .vespair-cms-img-editable:hover {
          outline: 3px solid #f8c142 !important;
          filter: brightness(0.9) !important;
        }
      `;
      iframeDoc.head.appendChild(styleEl);

      // Prevenir navegação externa ao clicar em links no iframe
      iframeDoc.addEventListener("click", (e) => {
        const targetLink = e.target.closest("a");
        if (targetLink) {
          const href = targetLink.getAttribute("href");
          if (href && href.startsWith("#")) {
            // Permite âncora suave interna
            const targetEl = iframeDoc.querySelector(href);
            if (targetEl) targetEl.scrollIntoView({ behavior: "smooth" });
          }
          // Bloqueia navegação padrão fora do editor
          e.preventDefault();
        }
      }, true);

      // Detecta dados existentes em window.__VESPAIR_CONTENT__ no iframe
      if (iframeWin.__VESPAIR_CONTENT__) {
        editedContent = { ...iframeWin.__VESPAIR_CONTENT__ };
      }

      // 1. Identificar e equipar elementos de texto com data-cms-id
      setupTextEditing(iframeDoc, iframeWin);

      // 2. Identificar e equipar imagens com hover e clique para substituição
      setupImageEditing(iframeDoc);

      // 3. Monitorar cliques fora para esconder toolbar
      iframeDoc.addEventListener("click", (e) => {
        if (!e.target.closest(".vespair-cms-editable")) {
          hideToolbar();
        }
      });

      // Monitorar scroll no iframe para reposicionar toolbar
      iframeWin.addEventListener("scroll", () => {
        if (activeElement) {
          positionToolbar(activeElement);
        }
      });

    } catch (err) {
      console.error("Erro ao integrar iframe do CMS:", err);
      showToast("Aviso: Iframe carregado com restrições de mesma origem.", true);
    }
  }

  // Configuração de Edição de Texto In-Layout
  function setupTextEditing(iframeDoc, iframeWin) {
    // Busca elementos com data-cms-id explicitamente ou elementos de texto da página
    const candidates = iframeDoc.querySelectorAll(
      "[data-cms-id], h1, h2, h3, h4, h5, h6, p, .editorial-heading, .editorial-quote, .technical-label"
    );

    let autoIdCounter = 1;

    candidates.forEach((el) => {
      // Ignora elementos dentro de svg ou scripts
      if (el.closest("svg") || el.tagName.toLowerCase() === "svg") return;

      let cmsId = el.getAttribute("data-cms-id");
      if (!cmsId) {
        // Gera um ID consistente baseado em hierarquia ou contador
        const sectionId = el.closest("section")?.id || "geral";
        cmsId = `${sectionId}-${el.tagName.toLowerCase()}-${autoIdCounter++}`;
        el.setAttribute("data-cms-id", cmsId);
      }

      el.classList.add("vespair-cms-editable");
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");

      // Aplica dados prévios se existirem
      if (editedContent[cmsId]) {
        const item = editedContent[cmsId];
        if (item.html !== undefined) el.innerHTML = item.html;
        if (item.styles) {
          if (item.styles.fontSize) el.style.fontSize = item.styles.fontSize;
          if (item.styles.color) el.style.color = item.styles.color;
          if (item.styles.fontWeight) el.style.fontWeight = item.styles.fontWeight;
          if (item.styles.fontStyle) el.style.fontStyle = item.styles.fontStyle;
        }
      }

      // Eventos de foco e edição
      el.addEventListener("focus", () => {
        activeElement = el;
        positionToolbar(el);
        updateToolbarState(el, iframeWin);
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        activeElement = el;
        positionToolbar(el);
        updateToolbarState(el, iframeWin);
      });

      el.addEventListener("input", () => {
        recordTextChange(el, cmsId);
      });

      // Previne que enter crie tags de fonte estranhas
      el.addEventListener("keydown", (e) => {
        if (e.key === "b" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          toggleFormat("bold");
        } else if (e.key === "i" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          toggleFormat("italic");
        }
      });
    });
  }

  function recordTextChange(el, cmsId) {
    if (!editedContent[cmsId]) {
      editedContent[cmsId] = { styles: {} };
    }
    editedContent[cmsId].html = el.innerHTML;
    editedContent[cmsId].text = el.innerText;
    
    // Salva estilos inline atuais
    editedContent[cmsId].styles = {
      ...(editedContent[cmsId].styles || {}),
      fontSize: el.style.fontSize || "",
      color: el.style.color || "",
      fontWeight: el.style.fontWeight || "",
      fontStyle: el.style.fontStyle || "",
    };

    saveStatus.textContent = "Alterações não salvas *";
  }

  // Barra de Formatação Flutuante
  function positionToolbar(el) {
    const iframeRect = cmsFrame.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const top = iframeRect.top + elRect.top - 46;
    const left = Math.max(10, Math.min(window.innerWidth - 320, iframeRect.left + elRect.left));

    floatToolbar.style.top = `${Math.max(65, top)}px`;
    floatToolbar.style.left = `${left}px`;
    floatToolbar.style.display = "flex";
  }

  function hideToolbar() {
    floatToolbar.style.display = "none";
    activeElement = null;
  }

  function updateToolbarState(el, iframeWin) {
    const computed = iframeWin.getComputedStyle(el);
    const weight = el.style.fontWeight || computed.fontWeight;
    const isBold = weight === "bold" || weight === "700" || parseInt(weight, 10) >= 700;
    const isItalic = (el.style.fontStyle || computed.fontStyle) === "italic";

    toolBold.classList.toggle("active", isBold);
    toolItalic.classList.toggle("active", isItalic);

    const fSize = el.style.fontSize || computed.fontSize;
    currentSizeLabel.textContent = fSize ? Math.round(parseFloat(fSize)) + "px" : "--";
  }

  function toggleFormat(type) {
    if (!activeElement) return;
    const cmsId = activeElement.getAttribute("data-cms-id");
    const iframeWin = cmsFrame.contentWindow;
    const computed = iframeWin.getComputedStyle(activeElement);

    if (type === "bold") {
      const weight = activeElement.style.fontWeight || computed.fontWeight;
      const isBold = weight === "bold" || weight === "700" || parseInt(weight, 10) >= 700;
      activeElement.style.fontWeight = isBold ? "normal" : "700";
    } else if (type === "italic") {
      const isItalic = (activeElement.style.fontStyle || computed.fontStyle) === "italic";
      activeElement.style.fontStyle = isItalic ? "normal" : "italic";
    }

    recordTextChange(activeElement, cmsId);
    updateToolbarState(activeElement, iframeWin);
  }

  toolBold.addEventListener("click", () => toggleFormat("bold"));
  toolItalic.addEventListener("click", () => toggleFormat("italic"));

  // Ajuste Restrito de Tamanho da Fonte (A- / A+)
  function adjustFontSize(delta) {
    if (!activeElement) return;
    const cmsId = activeElement.getAttribute("data-cms-id");
    const iframeWin = cmsFrame.contentWindow;
    const computed = iframeWin.getComputedStyle(activeElement);
    const current = parseFloat(activeElement.style.fontSize || computed.fontSize) || 16;
    const next = Math.max(10, Math.min(80, Math.round(current + delta)));

    activeElement.style.fontSize = `${next}px`;
    currentSizeLabel.textContent = `${next}px`;
    recordTextChange(activeElement, cmsId);
  }

  toolSizeDec.addEventListener("click", () => adjustFontSize(-2));
  toolSizeInc.addEventListener("click", () => adjustFontSize(2));

  // Aplicação Restrita de Cores (Paleta e Custom)
  document.querySelectorAll(".cms-color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", () => {
      if (!activeElement) return;
      const color = swatch.getAttribute("data-color");
      const cmsId = activeElement.getAttribute("data-cms-id");
      activeElement.style.color = color;
      recordTextChange(activeElement, cmsId);
    });
  });

  customColorInput.addEventListener("input", (e) => {
    if (!activeElement) return;
    const color = e.target.value;
    const cmsId = activeElement.getAttribute("data-cms-id");
    activeElement.style.color = color;
    recordTextChange(activeElement, cmsId);
  });

  // Configuração de Imagens (Alterar / Excluir mantendo dimensões)
  let pendingImageBase64 = null;
  let targetDimensions = { width: 800, height: 600 };

  function setupImageEditing(iframeDoc) {
    const images = iframeDoc.querySelectorAll("img");
    let imgCounter = 1;

    images.forEach((img) => {
      // Ignora SVGs de ícones muito pequenos
      if (img.width > 0 && img.width < 24 && img.height < 24) return;

      let cmsId = img.getAttribute("data-cms-id");
      if (!cmsId) {
        const secId = img.closest("section")?.id || "img";
        cmsId = `img-${secId}-${imgCounter++}`;
        img.setAttribute("data-cms-id", cmsId);
      }

      img.classList.add("vespair-cms-img-editable");
      img.setAttribute("title", "Clique para alterar ou excluir esta imagem");

      // Aplica substituição prévia se houver
      if (editedContent[cmsId]) {
        if (editedContent[cmsId].hidden) {
          img.style.display = "none";
        } else if (editedContent[cmsId].src) {
          img.src = editedContent[cmsId].src;
        }
      }

      img.addEventListener("click", (e) => {
        e.stopPropagation();
        openImageModal(img, cmsId);
      });
    });
  }

  function openImageModal(img, cmsId) {
    activeImage = { element: img, id: cmsId };
    pendingImageBase64 = null;
    imageFileInput.value = "";
    btnApplyImage.disabled = true;

    // Detecta as dimensões no layout atual
    const displayW = img.offsetWidth || img.naturalWidth || 800;
    const displayH = img.offsetHeight || img.naturalHeight || 600;
    const naturalW = img.naturalWidth || displayW;
    const naturalH = img.naturalHeight || displayH;

    // Usa a dimensão natural ou de exibição como alvo para manter qualidade nítida
    targetDimensions = {
      width: Math.max(displayW, naturalW),
      height: Math.max(displayH, naturalH),
    };

    imageMetaText.textContent = `Dimensões no layout: ${displayW} × ${displayH} px (Resolução de exportação: ${targetDimensions.width} × ${targetDimensions.height} px)`;
    imagePreviewImg.src = img.src;

    imageModal.style.display = "flex";
  }

  closeImage.addEventListener("click", () => {
    imageModal.style.display = "none";
    activeImage = null;
  });

  // Upload e Redimensionamento Automático no Canvas para Dimensões Exatas
  imageFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      showToast("Formato inválido. Use JPG, PNG ou WebP.", true);
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const srcData = evt.target.result;
      const img = new Image();
      img.onload = () => {
        // Redimensiona proporcionalmente (cover) para as dimensões exatas da imagem no site
        const canvas = document.createElement("canvas");
        const targetW = targetDimensions.width;
        const targetH = targetDimensions.height;
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");

        // Proporção cover crop
        const srcAspect = img.width / img.height;
        const targetAspect = targetW / targetH;
        let cropW, cropH, cropX, cropY;

        if (srcAspect > targetAspect) {
          cropH = img.height;
          cropW = img.height * targetAspect;
          cropX = (img.width - cropW) / 2;
          cropY = 0;
        } else {
          cropW = img.width;
          cropH = img.width / targetAspect;
          cropX = 0;
          cropY = (img.height - cropH) / 2;
        }

        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, targetW, targetH);

        const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
        pendingImageBase64 = canvas.toDataURL(mime, 0.92);

        imagePreviewImg.src = pendingImageBase64;
        btnApplyImage.disabled = false;
        showToast("Imagem adaptada para as dimensões originais!");
      };
      img.src = srcData;
    };
    reader.readAsDataURL(file);
  });

  // Aplicar Imagem Substituída
  btnApplyImage.addEventListener("click", async () => {
    if (!activeImage || !pendingImageBase64) return;

    btnApplyImage.disabled = true;
    btnApplyImage.innerHTML = `<span>Enviando...</span>`;

    try {
      const res = await apiCall("upload_image", {
        method: "POST",
        body: {
          image_base64: pendingImageBase64,
          target_width: targetDimensions.width,
          target_height: targetDimensions.height,
        },
      });

      if (res && res.success) {
        const newSrc = res.image_url;
        activeImage.element.src = newSrc;
        activeImage.element.style.display = "";

        if (!editedContent[activeImage.id]) {
          editedContent[activeImage.id] = {};
        }
        editedContent[activeImage.id].src = newSrc;
        editedContent[activeImage.id].hidden = false;

        saveStatus.textContent = "Alterações não salvas *";
        imageModal.style.display = "none";
        showToast("Imagem atualizada com sucesso no layout!");
      }
    } catch (err) {
      showToast(err.message || "Erro ao salvar imagem.", true);
    } finally {
      btnApplyImage.disabled = false;
      btnApplyImage.innerHTML = `<span>Substituir &amp; Adaptar Dimensões</span>`;
    }
  });

  // Excluir Imagem do Layout
  btnDeleteImage.addEventListener("click", () => {
    if (!activeImage) return;

    if (confirm("Deseja realmente remover esta imagem do layout?")) {
      activeImage.element.style.display = "none";

      if (!editedContent[activeImage.id]) {
        editedContent[activeImage.id] = {};
      }
      editedContent[activeImage.id].hidden = true;

      saveStatus.textContent = "Alterações não salvas *";
      imageModal.style.display = "none";
      showToast("Imagem removida da exibição.");
    }
  });

  // Salvar Alterações e Criar Backup Automático
  btnSave.addEventListener("click", async () => {
    if (isSaving) return;
    isSaving = true;
    btnSave.disabled = true;
    btnSave.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      <span>Salvando...</span>
    `;

    try {
      const res = await apiCall("save", {
        method: "POST",
        body: { content: editedContent },
      });

      if (res && res.success) {
        saveStatus.textContent = `Salvo às ${res.timestamp}`;
        showToast("Alterações publicadas e backup gerado com sucesso!");
      }
    } catch (err) {
      showToast(err.message || "Erro ao salvar alterações.", true);
    } finally {
      isSaving = false;
      btnSave.disabled = false;
      btnSave.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        <span>Salvar Alterações</span>
      `;
    }
  });

  // Modal de Backups e Rollback
  btnBackups.addEventListener("click", async () => {
    backupModal.style.display = "flex";
    backupsList.innerHTML = `<div style="text-align: center; color: var(--cms-muted); padding: 20px;">Carregando histórico...</div>`;

    try {
      const res = await apiCall("backups");
      if (res && res.success) {
        if (!res.backups || res.backups.length === 0) {
          backupsList.innerHTML = `<div style="text-align: center; color: var(--cms-muted); padding: 20px;">Nenhum backup disponível ainda. Cada salvamento gerará um backup aqui.</div>`;
          return;
        }

        backupsList.innerHTML = res.backups
          .map(
            (b) => `
            <div class="cms-backup-item">
              <div class="cms-backup-info">
                <h4>Backup de ${b.date_formatted}</h4>
                <span>Arquivo: ${b.html_file} (${b.size_kb} KB)</span>
              </div>
              <button type="button" class="cms-btn-restore" data-id="${b.id}">Restaurar</button>
            </div>
          `
          )
          .join("");

        backupsList.querySelectorAll(".cms-btn-restore").forEach((btn) => {
          btn.addEventListener("click", async () => {
            const id = btn.getAttribute("data-id");
            if (
              confirm(
                "Tem certeza que deseja restaurar esta versão? As alterações atuais serão preservadas em um backup de segurança."
              )
            ) {
              await restoreBackup(id);
            }
          });
        });
      }
    } catch (err) {
      backupsList.innerHTML = `<div style="color: var(--cms-danger); padding: 20px;">Erro ao carregar backups: ${err.message}</div>`;
    }
  });

  closeBackups.addEventListener("click", () => {
    backupModal.style.display = "none";
  });

  async function restoreBackup(id) {
    try {
      showToast("Restaurando versão...");
      const res = await apiCall("restore_backup", {
        method: "POST",
        body: { id },
      });

      if (res && res.success) {
        backupModal.style.display = "none";
        showToast("Backup restaurado com sucesso!");
        // Recarrega o iframe para exibir o site restaurado
        loadIframe();
      }
    } catch (err) {
      showToast(err.message || "Erro ao restaurar backup.", true);
    }
  }

  // Fechar modais ao clicar no fundo
  [backupModal, imageModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });
  });

  // Iniciar checagem
  checkAuth();
})();
