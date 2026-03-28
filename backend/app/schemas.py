# # from pydantic import BaseModel

# # class PredictionResponse(BaseModel):
# #     overlay_image: str
# #     raw_mask: str
# #     height: int
# #     width: int

# from pydantic import BaseModel


# class TumorStats(BaseModel):
#     tumor_detected: bool
#     tumor_pixel_count: int
#     tumor_area_pct: float
#     class_counts: dict
#     mean_tumor_confidence: float


# class SurvivalOutput(BaseModel):
#     predicted_class: str
#     predicted_label: str
#     class_probs: dict


# class PredictionResponse(BaseModel):
#     overlay_image: str
#     raw_mask: str
#     height: int
#     width: int
#     stats: TumorStats
#     survival: SurvivalOutput


from pydantic import BaseModel


class TumorStats(BaseModel):
    tumor_detected: bool
    tumor_pixel_count: int
    tumor_area_pct: float
    class_counts: dict
    mean_tumor_confidence: float


class SurvivalOutput(BaseModel):
    predicted_class: str           # "short" | "medium" | "long"
    predicted_label: str           # human-readable label
    class_probs: dict              # {"short": 0.70, "medium": 0.20, "long": 0.10}


class PredictionResponse(BaseModel):
    overlay_image: str             # PNG base64 MRI + overlay
    raw_mask: str                  # PNG base64 mask on black
    height: int
    width: int
    stats: TumorStats
    survival: SurvivalOutput