from pydantic import BaseModel

class PredictionResponse(BaseModel):
    overlay_image: str
    raw_mask: str
    height: int
    width: int