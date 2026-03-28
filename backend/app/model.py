# # from pathlib import Path
# # from typing import Optional

# # import torch
# # import torch.nn as nn

# # MODEL_PATH = Path("models/tumortrace_final.pth")
# # DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# # class DoubleConv(nn.Module):
# #     def __init__(self, in_ch, out_ch):
# #         super().__init__()
# #         self.net = nn.Sequential(
# #             nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
# #             nn.BatchNorm2d(out_ch),
# #             nn.ReLU(inplace=True),
# #             nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
# #             nn.BatchNorm2d(out_ch),
# #             nn.ReLU(inplace=True),
# #         )

# #     def forward(self, x):
# #         return self.net(x)


# # class UNet2D(nn.Module):
# #     def __init__(self, in_ch=4, n_classes=4, base_ch=32):
# #         super().__init__()
# #         self.inc = DoubleConv(in_ch, base_ch)
# #         self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch, base_ch * 2))
# #         self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 2, base_ch * 4))
# #         self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 4, base_ch * 8))
# #         self.down4 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 8, base_ch * 8))

# #         self.up1 = nn.ConvTranspose2d(base_ch * 8, base_ch * 8, 2, stride=2)
# #         self.conv1 = DoubleConv(base_ch * 16, base_ch * 4)
# #         self.up2 = nn.ConvTranspose2d(base_ch * 4, base_ch * 4, 2, stride=2)
# #         self.conv2 = DoubleConv(base_ch * 8, base_ch * 2)
# #         self.up3 = nn.ConvTranspose2d(base_ch * 2, base_ch * 2, 2, stride=2)
# #         self.conv3 = DoubleConv(base_ch * 4, base_ch)
# #         self.up4 = nn.ConvTranspose2d(base_ch, base_ch, 2, stride=2)
# #         self.conv4 = DoubleConv(base_ch * 2, base_ch)

# #         self.outc = nn.Conv2d(base_ch, n_classes, 1)

# #     def forward(self, x):
# #         x1 = self.inc(x)
# #         x2 = self.down1(x1)
# #         x3 = self.down2(x2)
# #         x4 = self.down3(x3)
# #         x5 = self.down4(x4)

# #         x = self.up1(x5)
# #         x = self.conv1(torch.cat([x, x4], dim=1))
# #         x = self.up2(x)
# #         x = self.conv2(torch.cat([x, x3], dim=1))
# #         x = self.up3(x)
# #         x = self.conv3(torch.cat([x, x2], dim=1))
# #         x = self.up4(x)
# #         x = self.conv4(torch.cat([x, x1], dim=1))
# #         logits = self.outc(x)
# #         return logits


# # _model: Optional[UNet2D] = None


# # def get_model() -> UNet2D:
# #     global _model
# #     if _model is None:
# #         model = UNet2D(in_ch=4, n_classes=4, base_ch=32)
# #         state = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
# #         model.load_state_dict(state)
# #         model.to(DEVICE)
# #         model.eval()
# #         _model = model
# #     return _model


# from pathlib import Path
# from typing import Optional, Tuple

# import torch
# import torch.nn as nn

# # Combined checkpoint that contains both UNet and SurvivalPredictor weights
# MODEL_PATH = Path("models/tumortrace_final.pth")
# DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# # ---------- Segmentation Model (UNet2D) ----------

# class DoubleConv(nn.Module):
#     def __init__(self, in_ch, out_ch):
#         super().__init__()
#         self.net = nn.Sequential(
#             nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
#             nn.BatchNorm2d(out_ch),
#             nn.ReLU(inplace=True),
#             nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
#             nn.BatchNorm2d(out_ch),
#             nn.ReLU(inplace=True),
#         )

#     def forward(self, x):
#         return self.net(x)


# class UNet2D(nn.Module):
#     def __init__(self, in_ch=4, n_classes=4, base_ch=32):
#         super().__init__()
#         self.inc   = DoubleConv(in_ch, base_ch)
#         self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch,     base_ch * 2))
#         self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 2, base_ch * 4))
#         self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 4, base_ch * 8))
#         self.down4 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 8, base_ch * 8))

#         self.up1   = nn.ConvTranspose2d(base_ch * 8, base_ch * 8, 2, stride=2)
#         self.conv1 = DoubleConv(base_ch * 16, base_ch * 4)
#         self.up2   = nn.ConvTranspose2d(base_ch * 4, base_ch * 4, 2, stride=2)
#         self.conv2 = DoubleConv(base_ch * 8,  base_ch * 2)
#         self.up3   = nn.ConvTranspose2d(base_ch * 2, base_ch * 2, 2, stride=2)
#         self.conv3 = DoubleConv(base_ch * 4,  base_ch)
#         self.up4   = nn.ConvTranspose2d(base_ch,      base_ch,      2, stride=2)
#         self.conv4 = DoubleConv(base_ch * 2,  base_ch)

#         self.outc  = nn.Conv2d(base_ch, n_classes, 1)

#     def forward(self, x):
#         x1 = self.inc(x)
#         x2 = self.down1(x1)
#         x3 = self.down2(x2)
#         x4 = self.down3(x3)
#         x5 = self.down4(x4)

#         x  = self.up1(x5)
#         x  = self.conv1(torch.cat([x, x4], dim=1))
#         x  = self.up2(x)
#         x  = self.conv2(torch.cat([x, x3], dim=1))
#         x  = self.up3(x)
#         x  = self.conv3(torch.cat([x, x2], dim=1))
#         x  = self.up4(x)
#         x  = self.conv4(torch.cat([x, x1], dim=1))
#         logits = self.outc(x)
#         return logits


# # ---------- Survival Predictor MLP ----------

# class SurvivalPredictor(nn.Module):
#     """
#     MLP that takes 7 radiomic features + age and predicts
#     3 survival buckets: short / medium / long.
#     """
#     def __init__(self, in_feats: int = 7, n_surv_cls: int = 3):
#         super().__init__()
#         self.net = nn.Sequential(
#             nn.Linear(in_feats, 64),
#             nn.BatchNorm1d(64),
#             nn.ReLU(),
#             nn.Dropout(0.3),
#             nn.Linear(64, 32),
#             nn.BatchNorm1d(32),
#             nn.ReLU(),
#             nn.Dropout(0.3),
#             nn.Linear(32, n_surv_cls),
#         )

#     def forward(self, x):
#         return self.net(x)


# # ---------- Lazy-loaded global models ----------

# _unet: Optional[UNet2D] = None
# _surv: Optional[SurvivalPredictor] = None


# def get_models() -> Tuple[UNet2D, SurvivalPredictor]:
#     """
#     Returns (unet_model, survival_model).
#     Loads weights from a single combined checkpoint the first time.
#     """
#     global _unet, _surv

#     if _unet is None or _surv is None:
#         ckpt = torch.load(MODEL_PATH, map_location=DEVICE)

#         unet_state = ckpt.get("unet_state", ckpt)  # backward compatible
#         surv_state = ckpt.get("surv_state")

#         unet = UNet2D(in_ch=4, n_classes=4, base_ch=32)
#         unet.load_state_dict(unet_state)
#         unet.to(DEVICE)
#         unet.eval()

#         surv = SurvivalPredictor(in_feats=7, n_surv_cls=3)
#         if surv_state is not None:
#             surv.load_state_dict(surv_state)
#         else:
#             # If no survival weights are present, keep random init,
#             # but this should be avoided in production.
#             print("[WARN] No 'surv_state' in checkpoint — survival head untrained.")
#         surv.to(DEVICE)
#         surv.eval()

#         _unet, _surv = unet, surv

#     return _unet, _surv



from pathlib import Path
from typing import Optional, Tuple

import torch
import torch.nn as nn
import torch.nn.functional as F

# ============================================================
# CONFIG
# ============================================================

MODEL_PATH = Path("models/tumortrace_final.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================
# UNET (MATCHES TRAINING EXACTLY)
# ============================================================

class DoubleConv(nn.Module):
    def __init__(self, in_c, out_c, dropout_p=0.2):
        super().__init__()
        layers = [
            nn.Conv2d(in_c, out_c, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.ReLU(inplace=True),

            nn.Conv2d(out_c, out_c, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.ReLU(inplace=True),
        ]
        if dropout_p > 0:
            layers.append(nn.Dropout2d(dropout_p))

        self.block = nn.Sequential(*layers)

    def forward(self, x):
        return self.block(x)


class Down(nn.Module):
    def __init__(self, in_c, out_c, dp=0.2):
        super().__init__()
        self.mp = nn.Sequential(
            nn.MaxPool2d(2),
            DoubleConv(in_c, out_c, dp)
        )

    def forward(self, x):
        return self.mp(x)


class Up(nn.Module):
    def __init__(self, in_c, out_c, bilinear=True, dp=0.2):
        super().__init__()

        if bilinear:
            self.up = nn.Upsample(scale_factor=2, mode="bilinear", align_corners=True)
            self.conv = DoubleConv(in_c, out_c, dp)
        else:
            self.up = nn.ConvTranspose2d(in_c // 2, in_c // 2, 2, stride=2)
            self.conv = DoubleConv(in_c, out_c, dp)

    def forward(self, x1, x2):
        x1 = self.up(x1)

        diffY = x2.size(2) - x1.size(2)
        diffX = x2.size(3) - x1.size(3)

        x1 = F.pad(x1, [
            diffX // 2, diffX - diffX // 2,
            diffY // 2, diffY - diffY // 2
        ])

        return self.conv(torch.cat([x2, x1], dim=1))


class UNet(nn.Module):
    def __init__(self, n_ch=4, n_cls=4, base=32, dp=0.2, bilinear=True):
        super().__init__()

        f = 2 if bilinear else 1

        self.inc = DoubleConv(n_ch, base, dp)
        self.d1  = Down(base, base * 2, dp)
        self.d2  = Down(base * 2, base * 4, dp)
        self.d3  = Down(base * 4, base * 8, dp)
        self.d4  = Down(base * 8, base * 16 // f, dp)

        self.u1  = Up(base * 16, base * 8 // f, bilinear, dp)
        self.u2  = Up(base * 8, base * 4 // f, bilinear, dp)
        self.u3  = Up(base * 4, base * 2 // f, bilinear, dp)
        self.u4  = Up(base * 2, base, bilinear, dp)

        self.outc = nn.Conv2d(base, n_cls, 1)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.d1(x1)
        x3 = self.d2(x2)
        x4 = self.d3(x3)
        x5 = self.d4(x4)

        x = self.u1(x5, x4)
        x = self.u2(x, x3)
        x = self.u3(x, x2)
        x = self.u4(x, x1)

        return self.outc(x)


# ============================================================
# SURVIVAL MODEL
# ============================================================

class SurvivalPredictor(nn.Module):
    def __init__(self, in_feats=7, n_classes=3):
        super().__init__()

        self.net = nn.Sequential(
            nn.Linear(in_feats, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(32, n_classes),
        )

    def forward(self, x):
        return self.net(x)


# ============================================================
# MODEL LOADER
# ============================================================

_unet: Optional[UNet] = None
_surv: Optional[SurvivalPredictor] = None


def get_models() -> Tuple[UNet, SurvivalPredictor]:
    global _unet, _surv

    if _unet is None or _surv is None:
        print("🔄 Loading models...")

        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

        ckpt = torch.load(MODEL_PATH, map_location=DEVICE)

        # Support both formats
        unet_state = ckpt.get("unet_state", ckpt)
        surv_state = ckpt.get("surv_state")

        # 🔥 LOAD UNET
        unet = UNet(n_ch=4, n_cls=4, base=32, dp=0.2)

        try:
            unet.load_state_dict(unet_state)
        except Exception as e:
            print("❌ UNet loading failed:", e)
            print("⚠️ Trying strict=False (temporary fix)")
            unet.load_state_dict(unet_state, strict=False)

        unet.to(DEVICE)
        unet.eval()

        # 🔥 LOAD SURVIVAL MODEL
        surv = SurvivalPredictor(in_feats=7, n_classes=3)

        if surv_state:
            try:
                surv.load_state_dict(surv_state)
            except Exception as e:
                print("⚠️ Survival model load failed:", e)
        else:
            print("⚠️ No survival weights found")

        surv.to(DEVICE)
        surv.eval()

        _unet, _surv = unet, surv

        print("✅ Models loaded successfully")

    return _unet, _surv