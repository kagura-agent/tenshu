#!/usr/bin/env python3
"""Generate anime character portraits and backgrounds for Tenshu dashboard."""

import json
import os
import random
import sys
import time
import urllib.request
import urllib.error

COMFYUI_URL = "http://localhost:8188"
OUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "client", "public", "assets")

# Character prompts - general anime archetypes that map to agent roles
CHARACTERS = {
    "strategist": {
        "name": "Strategist (Planner)",
        "prompt": "anime portrait, 1person, strategist, wise monk with scroll, Japanese robes, prayer beads, brown robe, calm expression, intelligent eyes, simple clean background, soft lighting, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "scientist": {
        "name": "Scientist (Researcher)",
        "prompt": "anime portrait, 1person, ninja researcher, red headband, dark navy outfit, holding book, sharp intelligent eyes, confident smirk, Japanese style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "engineer": {
        "name": "Engineer (Coder)",
        "prompt": "anime portrait, 1person, female samurai engineer, red armor plates, gold accents, katana on back, determined expression, bright eyes, futuristic visor, Japanese style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo, nsfw",
    },
    "guardian": {
        "name": "Guardian (QA)",
        "prompt": "anime portrait, 1person, shield warrior guardian, purple armor, spiked hair, protective stance, serious powerful expression, glowing shield emblem, Japanese style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "messenger": {
        "name": "Messenger (Comms)",
        "prompt": "anime portrait, 1person, swift messenger scout, teal outfit, hawk on shoulder, windswept hair, alert watchful expression, scarf blowing, Japanese style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "commander": {
        "name": "Commander (Leader)",
        "prompt": "anime portrait, 1person, castle lord shogun, ornate gold and red robes, war fan, commanding presence, noble expression, crown or headpiece, Japanese feudal lord style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    # Extra characters for user choice later
    "mage": {
        "name": "Mage (Alt)",
        "prompt": "anime portrait, 1person, mystic mage, flowing white hair, glowing blue eyes, arcane symbols, dark blue robe with gold trim, magical aura, Japanese fantasy style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "ronin": {
        "name": "Ronin (Alt)",
        "prompt": "anime portrait, 1person, wandering ronin, straw hat, worn katana, stubble, weathered face, mysterious half-smile, ragged kimono, cherry blossom petal, Japanese style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "kunoichi": {
        "name": "Kunoichi (Alt)",
        "prompt": "anime portrait, 1person, female ninja kunoichi, dark outfit, face mask pulled down, short hair, red eyes, dual kunai, stealthy, Japanese style, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo, nsfw",
    },
    "monk": {
        "name": "Monk (Alt)",
        "prompt": "anime portrait, 1person, young monk apprentice, shaved head, orange robes, gentle kind smile, prayer beads around neck, cherry blossom branch, zen garden background, Japanese Buddhist style, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
    "archer": {
        "name": "Archer (Alt)",
        "prompt": "anime portrait, 1person, shrine maiden archer, white and red miko outfit, long bow, long black hair, serene expression, spiritual aura, traditional Japanese, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo, nsfw",
    },
    "fox": {
        "name": "Fox Spirit (Alt)",
        "prompt": "anime portrait, 1person, kitsune fox spirit, fox ears, golden eyes, white hair, mischievous smile, traditional Japanese clothes, glowing fox fire, mysterious, simple clean background, bust shot, high quality anime art style, detailed face, masterpiece",
        "negative": "worst quality, low quality, blurry, deformed, ugly, extra fingers, bad anatomy, watermark, text, realistic, photo",
    },
}

BACKGROUNDS = {
    "warroom": {
        "name": "Traditional Japanese War Room",
        "width": 1344,
        "height": 768,
        "prompt": "Japanese castle war room interior, tatami floor, shoji screens, strategy maps on wooden table, hanging lanterns, warm amber lighting, incense smoke, scrolls and brushes, samurai armor display, feudal Japan, atmospheric, moody, cinematic, no people, detailed background, anime scenery, masterpiece, best quality",
        "negative": "worst quality, low quality, blurry, watermark, text, people, characters, modern",
    },
    "command_deck": {
        "name": "Cyberpunk Anime Command Center",
        "width": 1344,
        "height": 768,
        "prompt": "cyberpunk anime command center, holographic displays, neon blue and purple lighting, Japanese text on screens, futuristic control room, dark atmosphere, glowing monitors, data streams, tech aesthetic, torii gate hologram, kanji characters floating, no people, anime style scenery, masterpiece, best quality, detailed background",
        "negative": "worst quality, low quality, blurry, watermark, text, people, characters, realistic photo",
    },
}


def make_flux_workflow(positive_prompt, negative_prompt, seed, width=768, height=768,
                       steps=4, cfg=1.0, filename_prefix="tenshu"):
    """Flux Schnell workflow — 4 steps, fast generation."""
    return {
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "flux1-schnell.safetensors",
                "weight_dtype": "default",
            }
        },
        "2": {
            "class_type": "DualCLIPLoader",
            "inputs": {
                "clip_name1": "clip_l.safetensors",
                "clip_name2": "t5xxl_fp16.safetensors",
                "type": "flux",
            }
        },
        "3": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": "ae.safetensors"}
        },
        "4": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": positive_prompt, "clip": ["2", 0]}
        },
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": negative_prompt, "clip": ["2", 0]}
        },
        "6": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": width, "height": height, "batch_size": 1}
        },
        "7": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed, "steps": steps, "cfg": cfg,
                "sampler_name": "euler", "scheduler": "simple",
                "denoise": 1.0,
                "model": ["1", 0], "positive": ["4", 0],
                "negative": ["5", 0], "latent_image": ["6", 0],
            }
        },
        "8": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["7", 0], "vae": ["3", 0]}
        },
        "9": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": filename_prefix, "images": ["8", 0]}
        },
    }


def queue_prompt(workflow):
    payload = json.dumps({"prompt": workflow}).encode("utf-8")
    req = urllib.request.Request(
        f"{COMFYUI_URL}/prompt", data=payload,
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["prompt_id"]


def wait_for_completion(prompt_id, timeout=600):
    start = time.time()
    while time.time() - start < timeout:
        url = f"{COMFYUI_URL}/history/{prompt_id}"
        with urllib.request.urlopen(url) as resp:
            history = json.loads(resp.read())
        if prompt_id in history:
            return history[prompt_id]
        time.sleep(2)
    raise TimeoutError(f"Generation timed out after {timeout}s")


def download_image(filename, subfolder, output_path):
    url = f"{COMFYUI_URL}/view?filename={filename}&subfolder={subfolder}&type=output"
    urllib.request.urlretrieve(url, output_path)


def generate_all():
    # Check connection
    try:
        with urllib.request.urlopen(f"{COMFYUI_URL}/system_stats") as resp:
            stats = json.loads(resp.read())
        gpu = stats.get("devices", [{}])[0]
        vram_free = gpu.get("vram_free", 0) / (1024**3)
        print(f"ComfyUI connected. VRAM free: {vram_free:.1f}GB (lowvram mode OK)")
    except Exception as e:
        print(f"Cannot connect to ComfyUI: {e}")
        sys.exit(1)

    char_dir = os.path.join(OUT_DIR, "characters")
    bg_dir = os.path.join(OUT_DIR, "backgrounds")
    os.makedirs(char_dir, exist_ok=True)
    os.makedirs(bg_dir, exist_ok=True)

    total = len(CHARACTERS) + len(BACKGROUNDS)
    done = 0

    # Generate characters (768x768 portraits, 2 variations each)
    for char_id, data in CHARACTERS.items():
        for variant in range(2):
            seed = random.randint(0, 2**32 - 1)
            prefix = f"tenshu_char_{char_id}_{variant}"
            print(f"\n[{done+1}/{total*2}] {data['name']} (variant {variant+1})...", end=" ", flush=True)

            workflow = make_flux_workflow(
                data["prompt"], data["negative"], seed,
                width=768, height=768, steps=4, cfg=1.0,
                filename_prefix=prefix,
            )

            try:
                prompt_id = queue_prompt(workflow)
                result = wait_for_completion(prompt_id, timeout=300)
                outputs = result.get("outputs", {})
                for node_id, node_output in outputs.items():
                    if "images" in node_output:
                        for img in node_output["images"]:
                            out_path = os.path.join(char_dir, f"{char_id}_{variant}.png")
                            download_image(img["filename"], img.get("subfolder", ""), out_path)
                            print(f"OK -> {out_path}")
            except Exception as e:
                print(f"ERROR: {e}")

        done += 1

    # Generate backgrounds (1344x768, 2 variations each)
    for bg_id, data in BACKGROUNDS.items():
        for variant in range(2):
            seed = random.randint(0, 2**32 - 1)
            prefix = f"tenshu_bg_{bg_id}_{variant}"
            print(f"\n[{done+1}/{total*2}] {data['name']} (variant {variant+1})...", end=" ", flush=True)

            workflow = make_flux_workflow(
                data["prompt"], data["negative"], seed,
                width=data["width"], height=data["height"],
                steps=4, cfg=1.0, filename_prefix=prefix,
            )

            try:
                prompt_id = queue_prompt(workflow)
                result = wait_for_completion(prompt_id, timeout=300)
                outputs = result.get("outputs", {})
                for node_id, node_output in outputs.items():
                    if "images" in node_output:
                        for img in node_output["images"]:
                            out_path = os.path.join(bg_dir, f"{bg_id}_{variant}.png")
                            download_image(img["filename"], img.get("subfolder", ""), out_path)
                            print(f"OK -> {out_path}")
            except Exception as e:
                print(f"ERROR: {e}")

        done += 1

    print(f"\n\nDone! Generated {done*2} images.")
    print(f"Characters: {char_dir}/")
    print(f"Backgrounds: {bg_dir}/")


if __name__ == "__main__":
    generate_all()
