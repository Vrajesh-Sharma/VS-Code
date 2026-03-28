# import numpy as np
# from PIL import Image

# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel

# from .utils import (
#     load_image_from_bytes,
#     run_inference_on_image,
#     colorize_mask,
#     blend_overlay,
#     pil_to_base64,
#     get_tumor_stats,
# )


# class TumorStats(BaseModel):
#     tumor_detected: bool
#     tumor_pixel_count: int
#     tumor_area_pct: float
#     class_counts: dict


# class PredictionResponse(BaseModel):
#     overlay_image: str
#     raw_mask: str
#     height: int
#     width: int
#     stats: TumorStats


# app = FastAPI(
#     title="Tumor Trace Segmentation API",
#     version="1.0.0",
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.get("/health")
# async def health():
#     return {"status": "ok", "model": "UNet2D BraTS2020"}

# @app.post("/predict", response_model=PredictionResponse)
# async def predict(file: UploadFile = File(...)):
#     if file.content_type not in ("image/png", "image/jpeg", "image/jpg"):
#         raise HTTPException(status_code=400, detail="Only PNG or JPEG images accepted.")

#     data = await file.read()

#     arr = load_image_from_bytes(data, target_size=(240, 240))
#     mask = run_inference_on_image(arr)

#     print(f"[predict] Mask unique values: {np.unique(mask)}", flush=True)

#     # MRI + colored overlay
#     overlay_rgba = colorize_mask(mask)
#     blended = blend_overlay(arr, overlay_rgba)
#     overlay_b64 = pil_to_base64(blended)

#     # Mask on black background
#     mask_rgba = colorize_mask(mask)
#     bg = Image.new("RGBA", mask_rgba.size, (0, 0, 0, 255))
#     bg.paste(mask_rgba, mask=mask_rgba.split()[3])
#     mask_b64 = pil_to_base64(bg.convert("RGB"))

#     stats = get_tumor_stats(mask)
#     h, w = mask.shape

#     return PredictionResponse(
#         overlay_image=overlay_b64,
#         raw_mask=mask_b64,
#         height=h,
#         width=w,
#         stats=TumorStats(**stats),
#     )


import numpy as np
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .utils import (
    load_image_from_bytes,
    run_segmentation_and_survival,
    colorize_mask,
    blend_overlay,
    pil_to_base64,
    get_tumor_stats,
)


# ---------- Pydantic Schemas ----------

class TumorStats(BaseModel):
    tumor_detected: bool
    tumor_pixel_count: int
    tumor_area_pct: float
    class_counts: dict
    mean_tumor_confidence: float


class SurvivalOutput(BaseModel):
    predicted_class: str           # "short", "medium", "long"
    predicted_label: str           # "Short (<10 months)" etc.
    class_probs: dict              # {"short": 0.35, "medium": 0.4, "long": 0.25}


class PredictionResponse(BaseModel):
    overlay_image: str             # PNG base64 of MRI + overlay
    raw_mask: str                  # PNG base64 of mask on black
    height: int
    width: int
    stats: TumorStats
    survival: SurvivalOutput


# ---------- FastAPI App ----------

app = FastAPI(
    title="Tumor Trace Segmentation + Survival API",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model": "UNet2D BraTS2020 + SurvivalPredictor",
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(
    file: UploadFile = File(...),
    age: float = Form(..., description="Patient age in years"),
):

    """
    Upload an MRI slice (PNG/JPEG) + patient age.

    Returns:
      - tumour overlay image
      - raw mask image
      - basic mask stats
      - survival probability bucket (short/medium/long)
    """
    if file.content_type not in ("image/png", "image/jpeg", "image/jpg"):
        raise HTTPException(status_code=400, detail="Only PNG or JPEG images accepted.")

    if age <= 0 or age > 120:
        raise HTTPException(status_code=400, detail="Age must be in (0, 120].")

    data = await file.read()

    # 1) Load MRI slice
    arr = load_image_from_bytes(data, target_size=(240, 240))

    # 2) Run segmentation + survival in one go
    mask, conf_map, surv_probs, surv_class_idx = run_segmentation_and_survival(
        arr, patient_age=age
    )

    print(f"[predict] Mask unique values: {np.unique(mask)}", flush=True)

    # 3) MRI + coloured overlay
    overlay_rgba = colorize_mask(mask)
    blended = blend_overlay(arr, overlay_rgba)
    overlay_b64 = pil_to_base64(blended)

    # 4) Mask on black background
    mask_rgba = colorize_mask(mask)
    bg = Image.new("RGBA", mask_rgba.size, (0, 0, 0, 255))
    bg.paste(mask_rgba, mask=mask_rgba.split()[3])
    mask_b64 = pil_to_base64(bg.convert("RGB"))

    # 5) Stats + survival
    stats_dict = get_tumor_stats(mask, conf_map)
    h, w = mask.shape

    survival_labels = {
        0: ("short",  "Short (<10 months)"),
        1: ("medium", "Medium (10–15 months)"),
        2: ("long",   "Long (>15 months)"),
    }
    cls_key, cls_label = survival_labels[int(surv_class_idx)]

    survival_out = SurvivalOutput(
        predicted_class=cls_key,
        predicted_label=cls_label,
        class_probs={
            "short":  float(surv_probs[0]),
            "medium": float(surv_probs[1]),
            "long":   float(surv_probs[2]),
        },
    )

    return PredictionResponse(
        overlay_image=overlay_b64,
        raw_mask=mask_b64,
        height=h,
        width=w,
        stats=TumorStats(**stats_dict),
        survival=survival_out,
    )