# # app/main.py
# from fastapi import FastAPI, File, UploadFile, HTTPException
# from fastapi.middleware.cors import CORSMiddleware

# from .utils import (
#     load_image_from_bytes,
#     run_inference_on_image,
#     colorize_mask,
#     blend_overlay,
#     pil_to_base64,
# )
# from .schemas import PredictionResponse

# app = FastAPI(
#     title="NeuroVision Tumor Segmentation API",
#     version="0.1.0",
# )

# # CORS for local React dev
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],   # lock this down in prod
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.get("/health")
# async def health():
#     return {"status": "ok"}


# @app.post("/predict", response_model=PredictionResponse)
# async def predict(file: UploadFile = File(...)):
#     if file.content_type not in ("image/png", "image/jpeg", "image/jpg"):
#         raise HTTPException(status_code=400, detail="Please upload a PNG or JPEG image.")

#     data = await file.read()
#     img = load_image_from_bytes(data)     # (H, W), float32
#     mask = run_inference_on_image(img)    # (H, W), uint8 labels 0..3
#     import numpy as np
#     print("Mask unique values:", np.unique(mask), flush=True)

#     overlay_rgba = colorize_mask(mask)
#     blended = blend_overlay(img, overlay_rgba)

#     overlay_b64 = pil_to_base64(blended)

#     # also send raw mask visualization (for debug)
#     mask_img = colorize_mask(mask)
#     mask_b64 = pil_to_base64(mask_img)

#     h, w = mask.shape
#     return PredictionResponse(
#         overlay_image=overlay_b64,
#         raw_mask=mask_b64,
#         height=h,
#         width=w,
#     )


# app/main.py
import numpy as np
from PIL import Image

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .utils import (
    load_image_from_bytes,
    run_inference_on_image,
    colorize_mask,
    blend_overlay,
    pil_to_base64,
    get_tumor_stats,
)


class TumorStats(BaseModel):
    tumor_detected: bool
    tumor_pixel_count: int
    tumor_area_pct: float
    class_counts: dict


class PredictionResponse(BaseModel):
    overlay_image: str
    raw_mask: str
    height: int
    width: int
    stats: TumorStats


app = FastAPI(
    title="NeuroVision Tumor Segmentation API",
    version="1.0.0",
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
    return {"status": "ok", "model": "UNet2D BraTS2020"}

@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ("image/png", "image/jpeg", "image/jpg"):
        raise HTTPException(status_code=400, detail="Only PNG or JPEG images accepted.")

    data = await file.read()

    arr = load_image_from_bytes(data, target_size=(240, 240))
    mask = run_inference_on_image(arr)

    print(f"[predict] Mask unique values: {np.unique(mask)}", flush=True)

    # MRI + colored overlay
    overlay_rgba = colorize_mask(mask)
    blended = blend_overlay(arr, overlay_rgba)
    overlay_b64 = pil_to_base64(blended)

    # Mask on black background
    mask_rgba = colorize_mask(mask)
    bg = Image.new("RGBA", mask_rgba.size, (0, 0, 0, 255))
    bg.paste(mask_rgba, mask=mask_rgba.split()[3])
    mask_b64 = pil_to_base64(bg.convert("RGB"))

    stats = get_tumor_stats(mask)
    h, w = mask.shape

    return PredictionResponse(
        overlay_image=overlay_b64,
        raw_mask=mask_b64,
        height=h,
        width=w,
        stats=TumorStats(**stats),
    )