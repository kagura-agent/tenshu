import { Hono } from "hono";
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";

const avatars = new Hono();

const CONFIG_DIR = join(homedir(), ".tenshu");
const CONFIG_FILE = join(CONFIG_DIR, "avatars.json");

// Resolve the characters directory relative to the project root
// In dev: server runs from repo root, client/public has the assets
const CHARACTERS_DIR = join(
  import.meta.dirname,
  "..",
  "..",
  "..",
  "client",
  "public",
  "assets",
  "characters"
);

async function loadAvatarConfig(): Promise<Record<string, string>> {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function saveAvatarConfig(config: Record<string, string>): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  await writeFile(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// GET / — return current avatar config + available character images
avatars.get("/", async (c) => {
  const config = await loadAvatarConfig();
  return c.json(config);
});

// GET /available — list all available character images
avatars.get("/available", async (c) => {
  try {
    const files = await readdir(CHARACTERS_DIR);
    const images = files
      .filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".webp"))
      .map((f) => `/assets/characters/${f}`);

    // Also check for custom uploads
    try {
      const customDir = join(CHARACTERS_DIR, "custom");
      const customFiles = await readdir(customDir);
      const customImages = customFiles
        .filter((f) => f.endsWith(".png") || f.endsWith(".jpg") || f.endsWith(".webp"))
        .map((f) => `/assets/characters/custom/${f}`);
      images.push(...customImages);
    } catch {
      // custom dir doesn't exist yet, that's fine
    }

    return c.json(images);
  } catch (e) {
    return c.json({ error: (e as Error).message }, 500);
  }
});

// PUT /:agentId — set avatar for an agent
avatars.put("/:agentId", async (c) => {
  const agentId = c.req.param("agentId");
  const body = await c.req.json<{ image: string }>();

  if (!body.image) {
    return c.json({ error: "image is required" }, 400);
  }

  const config = await loadAvatarConfig();
  config[agentId] = body.image;
  await saveAvatarConfig(config);

  return c.json({ ok: true, agentId, image: body.image });
});

// POST /:agentId/upload — upload a custom avatar image
avatars.post("/:agentId/upload", async (c) => {
  const agentId = c.req.param("agentId");
  const body = await c.req.parseBody();
  const file = body["file"];

  if (!file || typeof file === "string") {
    return c.json({ error: "file is required" }, 400);
  }

  const customDir = join(CHARACTERS_DIR, "custom");
  await mkdir(customDir, { recursive: true });

  // Sanitize filename
  const ext = file.name?.split(".").pop() || "png";
  const filename = `${agentId}_${Date.now()}.${ext}`;
  const filePath = join(customDir, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const imagePath = `/assets/characters/custom/${filename}`;

  // Also update the config
  const config = await loadAvatarConfig();
  config[agentId] = imagePath;
  await saveAvatarConfig(config);

  return c.json({ ok: true, agentId, image: imagePath });
});

export default avatars;
