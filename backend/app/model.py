from pathlib import Path
from typing import Optional

import torch
import torch.nn as nn

MODEL_PATH = Path("models/unet_brats_slices_dice_0.729.pth")
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class DoubleConv(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv2d(in_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
            nn.Conv2d(out_ch, out_ch, 3, padding=1, bias=False),
            nn.BatchNorm2d(out_ch),
            nn.ReLU(inplace=True),
        )

    def forward(self, x):
        return self.net(x)


class UNet2D(nn.Module):
    def __init__(self, in_ch=4, n_classes=4, base_ch=32):
        super().__init__()
        self.inc = DoubleConv(in_ch, base_ch)
        self.down1 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch, base_ch * 2))
        self.down2 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 2, base_ch * 4))
        self.down3 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 4, base_ch * 8))
        self.down4 = nn.Sequential(nn.MaxPool2d(2), DoubleConv(base_ch * 8, base_ch * 8))

        self.up1 = nn.ConvTranspose2d(base_ch * 8, base_ch * 8, 2, stride=2)
        self.conv1 = DoubleConv(base_ch * 16, base_ch * 4)
        self.up2 = nn.ConvTranspose2d(base_ch * 4, base_ch * 4, 2, stride=2)
        self.conv2 = DoubleConv(base_ch * 8, base_ch * 2)
        self.up3 = nn.ConvTranspose2d(base_ch * 2, base_ch * 2, 2, stride=2)
        self.conv3 = DoubleConv(base_ch * 4, base_ch)
        self.up4 = nn.ConvTranspose2d(base_ch, base_ch, 2, stride=2)
        self.conv4 = DoubleConv(base_ch * 2, base_ch)

        self.outc = nn.Conv2d(base_ch, n_classes, 1)

    def forward(self, x):
        x1 = self.inc(x)
        x2 = self.down1(x1)
        x3 = self.down2(x2)
        x4 = self.down3(x3)
        x5 = self.down4(x4)

        x = self.up1(x5)
        x = self.conv1(torch.cat([x, x4], dim=1))
        x = self.up2(x)
        x = self.conv2(torch.cat([x, x3], dim=1))
        x = self.up3(x)
        x = self.conv3(torch.cat([x, x2], dim=1))
        x = self.up4(x)
        x = self.conv4(torch.cat([x, x1], dim=1))
        logits = self.outc(x)
        return logits


_model: Optional[UNet2D] = None


def get_model() -> UNet2D:
    global _model
    if _model is None:
        model = UNet2D(in_ch=4, n_classes=4, base_ch=32)
        state = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=True)
        model.load_state_dict(state)
        model.to(DEVICE)
        model.eval()
        _model = model
    return _model