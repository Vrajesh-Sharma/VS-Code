from pathlib import Path
from typing import Optional

import torch
import torch.nn as nn
import torch.nn.functional as F

# ============================================================
# CONFIG
# ============================================================

# Point this to your new UNet checkpoint from the notebook
# (e.g. the exported best_unetmodel.pth)
MODEL_PATH = Path("models/best_unet_model.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ============================================================
# UNET (4-channel input, 4 classes)
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
    """
    Same architecture as the training notebook UNetMulti:
    4-channel input, 4-way output (0 BG, 1 NCR/NET, 2 Edema, 3 ET).[file:1]
    """
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
# MODEL LOADER (SEGMENTATION ONLY)
# ============================================================

_unet: Optional[UNet] = None


def get_unet() -> UNet:
    """
    Lazily load the trained UNet weights from MODEL_PATH.[file:1]
    """
    global _unet

    if _unet is None:
        print("🔄 Loading UNet model...")

        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

        # Instantiate architecture exactly as trained
        unet = UNet(n_ch=4, n_cls=4, base=32, dp=0.2)

        ckpt = torch.load(MODEL_PATH, map_location=DEVICE)

        # Support plain state_dict or wrapped dict
        if isinstance(ckpt, dict) and "state_dict" in ckpt:
            state = ckpt["state_dict"]
        else:
            state = ckpt

        unet.load_state_dict(state)
        unet.to(DEVICE)
        unet.eval()

        _unet = unet
        print("✅ UNet loaded successfully")

    return _unet