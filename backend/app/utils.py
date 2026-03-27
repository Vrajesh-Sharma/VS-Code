import base64
import io
import os
import tempfile
from typing import Tuple

import numpy as np
from PIL import Image
import torch
import torch.nn.functional as F

from .model import DEVICE, get_model

def load_image_from_bytes(data: bytes, target_size: Tuple[int, int] = (240, 240)) -> np.ndarray:
    """
    Load uploaded image (PNG/JPEG), resize to 240x240.
    Returns float32 (H, W) in original pixel range (0-255).
    """
    img = Image.open(io.BytesIO(data)).convert("L")   # grayscale
    img = img.resize(target_size, resample=Image.BILINEAR)
    arr = np.array(img).astype(np.float32)             # (H, W), 0..255
    return arr


def build_4channel_input(arr: np.ndarray) -> np.ndarray:
    """
    The model expects (H, W, 4) with 4 BraTS-style modalities, each z-score normalized.
    Since the user uploads a single-channel image, we simulate 4 channels by applying
    4 different normalizations/transformations that mimic multi-modal variety:
      ch0: z-score of original
      ch1: z-score of gamma-corrected (gamma=0.5, enhances bright regions)
      ch2: z-score of gamma-corrected (gamma=2.0, suppresses bright, enhances dark)
      ch3: z-score of CLAHE-like rescaling (local normalization via min-max)
    This gives the model 4 meaningfully different views, much closer to multi-modal
    training input than simply repeating the same channel.
    """
    def zscore(x):
        m, s = x.mean(), x.std() + 1e-8
        return (x - m) / s

    x = arr / 255.0  # [0, 1]

    ch0 = zscore(x)
    ch1 = zscore(np.power(np.clip(x, 0, 1), 0.5))    # brighten
    ch2 = zscore(np.power(np.clip(x, 0, 1), 2.0))    # darken
    # local min-max in 8x8 blocks (approximate CLAHE effect)
    x_local = x.copy()
    h, w = x_local.shape
    bs = 8
    for i in range(0, h, bs):
        for j in range(0, w, bs):
            blk = x_local[i:i+bs, j:j+bs]
            mn, mx = blk.min(), blk.max()
            x_local[i:i+bs, j:j+bs] = (blk - mn) / (mx - mn + 1e-8)
    ch3 = zscore(x_local)

    img4 = np.stack([ch0, ch1, ch2, ch3], axis=-1)   # (H, W, 4)
    return img4.astype(np.float32)

def run_inference_on_image(arr: np.ndarray) -> np.ndarray:
    """
    arr: (H, W) float32 in 0..255
    returns: mask (H, W) uint8, labels 0..3
    """
    model = get_model()

    img4 = build_4channel_input(arr)              # (H, W, 4)
    x = np.transpose(img4, (2, 0, 1))            # (4, H, W)
    x = torch.from_numpy(x).unsqueeze(0).to(DEVICE)  # (1, 4, H, W)

    with torch.no_grad(), torch.amp.autocast("cuda", enabled=DEVICE.type == "cuda"):
        logits = model(x)
        probs = torch.softmax(logits, dim=1)
        preds = torch.argmax(probs, dim=1)        # (1, H, W)

    mask = preds[0].cpu().numpy().astype(np.uint8)
    return mask

def colorize_mask(mask: np.ndarray) -> Image.Image:
    """
    mask: (H, W) labels 0..3
    Returns RGBA image with transparent background and colored tumor regions.
    """
    h, w = mask.shape
    overlay = np.zeros((h, w, 4), dtype=np.uint8)

    colors = {
        1: (0,   255,   0, 160),   # class 1: green  (edema)
        2: (255, 255,   0, 160),   # class 2: yellow (necrotic core)
        3: (255,   0,   0, 160),   # class 3: red    (enhancing tumor)
    }

    for cls, (r, g, b, a) in colors.items():
        overlay[mask == cls] = np.array([r, g, b, a], dtype=np.uint8)

    return Image.fromarray(overlay, mode="RGBA")

def blend_overlay(arr: np.ndarray, overlay_rgba: Image.Image) -> Image.Image:
    """
    arr: (H, W) float32, any range (will be auto-rescaled to 0..255)
    overlay_rgba: RGBA PIL Image (same H, W)
    Returns: RGB PIL Image — grayscale MRI with colored tumor highlighted on top.
    """
    # Rescale to 0..255 for display
    mn, mx = arr.min(), arr.max()
    display = ((arr - mn) / (mx - mn + 1e-8) * 255.0).astype(np.uint8)

    base_img = Image.fromarray(display, mode="L").convert("RGBA")
    blended = Image.alpha_composite(base_img, overlay_rgba)
    return blended.convert("RGB")

def pil_to_base64(img: Image.Image) -> str:
    buff = io.BytesIO()
    img.save(buff, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buff.getvalue()).decode("utf-8")

def get_tumor_stats(mask: np.ndarray) -> dict:
    """Return basic stats about the predicted tumor mask."""
    total = mask.size
    tumor_pixels = int((mask > 0).sum())
    tumor_pct = round(tumor_pixels / total * 100, 2)

    stats = {
        "tumor_detected": tumor_pixels > 0,
        "tumor_pixel_count": tumor_pixels,
        "tumor_area_pct": tumor_pct,
        "class_counts": {
            "edema":           int((mask == 1).sum()),
            "necrotic_core":   int((mask == 2).sum()),
            "enhancing_tumor": int((mask == 3).sum()),
        }
    }
    return stats