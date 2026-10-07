import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Determina caminhos de arquivos estáticos e diretório do site
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  const clientPublicPath = path.resolve(__dirname, "..", "client", "public");

  // Estado simples de autenticação para o servidor Express local
  const sessions = new Set<string>();
  const rateLimitAttempts = new Map<string, { attempts: number; lastAttempt: number }>();

  // Bloquear acesso direto à pasta de backups
  app.use("/admin/backups", (_req, res) => {
    res.status(403).json({ error: "Acesso negado a arquivos de backup." });
  });

  // API do CMS (compatível com os mesmos endpoints do api.php)
  const handleCmsApi = async (req: express.Request, res: express.Response) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    const action = req.query.action || req.body?.action;

    // Rate Limiting para Login
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const now = Date.now();

    if (action === "login") {
      const attempt = rateLimitAttempts.get(ip) || { attempts: 0, lastAttempt: now };
      if (attempt.attempts >= 5 && now - attempt.lastAttempt < 15 * 60 * 1000) {
        const mins = Math.ceil((15 * 60 * 1000 - (now - attempt.lastAttempt)) / 60000);
        return res.status(429).json({
          success: false,
          message: `Muitas tentativas incorretas. Tente novamente em ${mins} minutos.`,
        });
      }

      const { username, password } = req.body || {};
      if (username === "admin" && password === "nimda") {
        rateLimitAttempts.delete(ip);
        const token = crypto.randomBytes(32).toString("hex");
        sessions.add(token);
        res.cookie("vespair_cms_token", token, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 86400 * 1000,
        });
        return res.json({
          success: true,
          message: "Login realizado com sucesso.",
          csrf_token: token,
        });
      } else {
        rateLimitAttempts.set(ip, {
          attempts: attempt.attempts + 1,
          lastAttempt: now,
        });
        return res.status(401).json({
          success: false,
          message: "Usuário ou senha inválidos.",
        });
      }
    }

    const getSessionToken = (req: express.Request): string | null => {
      const headerToken = req.headers["x-cms-token"];
      if (typeof headerToken === "string") return headerToken;
      const cookieHeader = req.headers.cookie;
      if (cookieHeader) {
        const match = cookieHeader.match(/vespair_cms_token=([a-zA-Z0-9_-]+)/);
        if (match) return match[1];
      }
      return null;
    };

    if (action === "check") {
      const token = getSessionToken(req);
      const isAuth = typeof token === "string" && sessions.has(token);
      return res.json({ authenticated: isAuth, csrf_token: isAuth ? token : null });
    }

    if (action === "logout") {
      const token = getSessionToken(req);
      if (typeof token === "string") sessions.delete(token);
      res.clearCookie("vespair_cms_token");
      return res.json({ success: true, message: "Sessão encerrada." });
    }

    // Middleware de autenticação para as demais ações
    const token = getSessionToken(req);
    if (!token || typeof token !== "string" || !sessions.has(token)) {
      return res.status(401).json({ success: false, message: "Sessão não autenticada." });
    }

    // Garante que a pasta de backups exista tanto em dist quanto em client
    const backupDirs = [
      path.join(staticPath, "admin", "backups"),
      path.join(clientPublicPath, "admin", "backups"),
    ];
    for (const bDir of backupDirs) {
      if (!fs.existsSync(bDir)) fs.mkdirSync(bDir, { recursive: true });
    }

    if (action === "save") {
      const content = req.body?.content;
      if (!content || typeof content !== "object") {
        return res.status(400).json({ success: false, message: "Dados de conteúdo inválidos." });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/T/, "_")
        .replace(/:/g, "-")
        .replace(/\..+/, "");

      const jsonStr = JSON.stringify(content);
      const cmsScript = `<script id="vespair-cms-data">window.__VESPAIR_CONTENT__ = ${jsonStr};</script>`;

      // Atualiza index.html em staticPath e client
      const indexFiles = [
        path.join(staticPath, "index.html"),
        path.join(clientPublicPath, "index.html"),
        path.resolve(__dirname, "..", "client", "index.html"),
      ];

      for (const idxFile of indexFiles) {
        if (fs.existsSync(idxFile)) {
          const currentHtml = fs.readFileSync(idxFile, "utf-8");

          // Cria backup na primeira pasta válida
          const backupHtml = path.join(backupDirs[0], `index_${timestamp}.html`);
          const backupJson = path.join(backupDirs[0], `content_${timestamp}.json`);
          fs.writeFileSync(backupHtml, currentHtml);
          fs.writeFileSync(
            backupJson,
            JSON.stringify(
              {
                timestamp,
                date_formatted: new Date().toLocaleString("pt-BR"),
                content,
              },
              null,
              2
            )
          );

          let newHtml = currentHtml;
          if (newHtml.includes('<script id="vespair-cms-data">')) {
            newHtml = newHtml.replace(
              /<script id="vespair-cms-data">[\s\S]*?<\/script>/,
              cmsScript
            );
          } else {
            newHtml = newHtml.replace("</head>", `  ${cmsScript}\n</head>`);
          }
          fs.writeFileSync(idxFile, newHtml, "utf-8");
        }
      }

      return res.json({
        success: true,
        message: "Alterações salvas e backup gerado com sucesso.",
        backup_id: `index_${timestamp}.html`,
        timestamp: new Date().toLocaleString("pt-BR"),
      });
    }

    if (action === "upload_image") {
      const { image_base64 } = req.body || {};
      if (!image_base64 || typeof image_base64 !== "string") {
        return res.status(400).json({ success: false, message: "Nenhuma imagem base64 enviada." });
      }

      const matches = image_base64.match(/^data:image\/(jpeg|png|webp);base64,(.+)$/);
      if (!matches) {
        return res.status(400).json({ success: false, message: "Formato de imagem inválido." });
      }

      const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
      const buffer = Buffer.from(matches[2], "base64");
      const filename = `cms_${Date.now()}_${crypto.randomBytes(3).toString("hex")}.${ext}`;

      const targetDirs = [
        path.join(staticPath, "images"),
        path.join(clientPublicPath, "images"),
      ];

      for (const tDir of targetDirs) {
        if (!fs.existsSync(tDir)) fs.mkdirSync(tDir, { recursive: true });
        fs.writeFileSync(path.join(tDir, filename), buffer);
      }

      return res.json({
        success: true,
        message: "Imagem enviada e adaptada com sucesso.",
        image_url: `./images/${filename}`,
        filename,
      });
    }

    if (action === "backups") {
      const primaryBackupDir = backupDirs[0];
      if (!fs.existsSync(primaryBackupDir)) {
        return res.json({ success: true, backups: [] });
      }

      const files = fs.readdirSync(primaryBackupDir);
      const jsonFiles = files.filter((f) => f.startsWith("content_") && f.endsWith(".json"));

      const backups = jsonFiles
        .map((f) => {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(primaryBackupDir, f), "utf-8"));
            const id = f.replace("content_", "").replace(".json", "");
            const htmlFile = `index_${id}.html`;
            const stats = fs.statSync(path.join(primaryBackupDir, f));
            return {
              id,
              html_file: htmlFile,
              timestamp: data.timestamp || id,
              date_formatted: data.date_formatted || stats.mtime.toLocaleString("pt-BR"),
              size_kb: Math.round(stats.size / 1024),
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .sort((a, b) => b!.timestamp.localeCompare(a!.timestamp));

      return res.json({ success: true, backups });
    }

    if (action === "restore_backup") {
      const id = String(req.body?.id || "").replace(/[^a-zA-Z0-9_-]/g, "");
      if (!id) {
        return res.status(400).json({ success: false, message: "ID de backup inválido." });
      }

      const backupHtml = path.join(backupDirs[0], `index_${id}.html`);
      if (!fs.existsSync(backupHtml)) {
        return res.status(404).json({ success: false, message: "Arquivo de backup não encontrado." });
      }

      const restoredHtml = fs.readFileSync(backupHtml, "utf-8");
      const indexFiles = [
        path.join(staticPath, "index.html"),
        path.join(clientPublicPath, "index.html"),
        path.resolve(__dirname, "..", "client", "index.html"),
      ];

      for (const idxFile of indexFiles) {
        if (fs.existsSync(idxFile)) {
          fs.writeFileSync(idxFile, restoredHtml, "utf-8");
        }
      }

      return res.json({
        success: true,
        message: "Backup restaurado com sucesso.",
        restored_id: id,
      });
    }

    return res.status(400).json({ success: false, message: "Ação não especificada ou inválida." });
  };

  app.all("/admin/api", handleCmsApi);
  app.all("/admin/api.php", handleCmsApi);

  // Serve static files from dist/public in production or development
  app.use(express.static(staticPath));

  // Serve admin directly
  app.get("/admin", (_req, res) => {
    res.sendFile(path.join(staticPath, "admin", "index.html"));
  });
  app.get("/admin/*", (req, res, next) => {
    const adminFile = path.join(staticPath, req.path);
    if (fs.existsSync(adminFile) && fs.statSync(adminFile).isFile()) {
      return res.sendFile(adminFile);
    }
    res.sendFile(path.join(staticPath, "admin", "index.html"));
  });

  // Handle client-side routing - serve index.html for all other routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`CMS Admin running on http://localhost:${port}/admin`);
  });
}

startServer().catch(console.error);
