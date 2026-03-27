# app/schemas.py
from pydantic import BaseModel


class PredictionResponse(BaseModel):
    overlay_image: str   # data URL
    raw_mask: str        # data URL of mask only (optional)
    height: int
    width: int