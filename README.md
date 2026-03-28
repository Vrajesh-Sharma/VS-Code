# TumorTrace – Brain Tumor Segmentation and Reporting

TumorTrace is an end‑to‑end system for **pixel‑wise brain tumor segmentation** from MRI slices.
It combines a U‑Net model trained on the **BraTS2020** dataset with a **FastAPI** backend
and a **React + Vite + Tailwind** frontend designed for radiologists.

Given a brain MRI slice, TumorTrace predicts **four classes** per pixel:

- Background  
- Edema  
- Necrotic / non‑enhancing tumor core  
- Enhancing (active) tumor  

and returns an MRI with a **color‑coded overlay** plus a small TumorTrace report
showing tumor area and per‑class statistics.

---

## 🔍 Highlights

- **Serious dataset** – trained on BraTS2020 (multi‑modal MRI, expert masks).  
- **True segmentation**, not just classification: pixel‑level mapping of tumor sub‑regions.  
- **U‑Net architecture** – 2D encoder–decoder with skip connections, optimized for medical images.  
- **Dice‑based training** – Cross‑Entropy + Dice Loss, evaluated with foreground Dice score.  
- **Web‑ready** – FastAPI `/predict` endpoint + React/Vite/Tailwind UI for clinicians.  
- **TumorTrace report** – MRI + overlay + textual stats (tumor area %, class counts).

---

## 🧠 Model Overview

- **Architecture:** 2D U‑Net  
- **Input shape:** `4 × 240 × 240`  
  - 4 MRI modalities (T1, T1Gd, T2, FLAIR) in training  
  - 4 synthetic channels built from grayscale image at inference time  
- **Output shape:** `4 × 240 × 240` (background + 3 tumor classes)  
- **Encoder:** 4 downsampling blocks  
  - Channels: 4 → 32 → 64 → 128 → 256  
- **Decoder:** 4 upsampling blocks with skip connections  
- **Loss:** Cross‑Entropy + multi‑class Dice  
- **Metric:** Mean Dice on tumor classes (foreground)  
- **Training:**  
  - Train slices: 45,756  
  - Val slices: 11,439  
  - Batch size: 32  
  - Optimizer: AdamW (lr = 1e‑3, cosine annealing)  
  - Hardware: Kaggle GPU (Tesla P100), mixed precision (AMP)  

After ~20 epochs, the model reaches **>0.8 foreground Dice** on the validation set, with loss steadily decreasing and Dice steadily increasing.

---

## 📦 Dataset

We use a Kaggle mirror of **BraTS2020**.

Each `.h5` file contains:

- `image`: `(240, 240, 4)` – 4 MRI sequences per slice  
- `mask`: `(240, 240, 3)` – one‑hot tumor sub‑regions

During preprocessing we:

1. Convert the 3‑channel mask to a single label map with values in `{0, 1, 2, 3}`.  
2. Apply per‑channel z‑score normalization on the image.  
3. Perform random horizontal/vertical flips as augmentation.

> ⚠️ The raw BraTS data is not included in this repo due to licensing.
> Use the Kaggle dataset or official BraTS sources and point the config to your local path.

---

## 🏗️ Repo Structure

```text
.
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app and /predict endpoint
│   │   ├── model.py         # U-Net definition + checkpoint loading
│   │   └── utils.py         # Pre/postprocessing, colorization, stats
│   └── models/
│       └── best_unet_brats_slices.pth   # trained model weights (not tracked)
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx          # React UI (upload, visualize, stats)
│       └── main.jsx
│
├── notebooks/
│   └── training_unet_brats.ipynb        # Kaggle-style training notebook
│
├── reports/
│   ├── TumorTrace_Report.tex            # LaTeX project report
│   └── figures/                         # training_curves, predictions, etc.
│
└── README.md
```

---

## ⚙️ Backend: FastAPI

### Install dependencies

From `backend/`:

```bash
python -m venv .venv
source .venv/bin/activate         # Windows: .venv\Scripts\activate
pip install -r requirements.txt   # or: pip install fastapi uvicorn torch torchvision pillow numpy python-multipart
```

Place your trained model weights as:

```text
backend/models/best_unet_brats_slices.pth
```

### Run the API

```bash
uvicorn app.main:app --reload --port 8000
```

Key endpoint:

- `POST /predict`
  - Input: multipart form with `file` (PNG/JPEG MRI slice)  
  - Output: JSON with:
    - `overlay_image`: `data:image/png;base64,...` (MRI + color overlay)  
    - `raw_mask`: base64 mask visualization  
    - `stats`: tumor area %, per‑class pixel counts, detection flag  

You can test it quickly via the built‑in docs at `http://localhost:8000/docs`.

---

## 💻 Frontend: React + Vite + Tailwind

From `frontend/`:

```bash
npm install
```

Configure the backend URL in `.env`:

```env
VITE_API_BASE=http://127.0.0.1:8000
```

Run the dev server:

```bash
npm run dev
```

The UI lets you:

1. Upload a brain MRI slice (PNG/JPEG).  
2. See an input preview.  
3. See the MRI with green/yellow/red tumor overlay.  
4. See a TumorTrace summary card with tumor area and class‑wise counts.

---

## 🧪 Training the Model (Kaggle / local)

The `notebooks/training_unet_brats.ipynb` notebook contains:

- Data loading from the BraTS2020 `.h5` Kaggle dataset.  
- Preprocessing and augmentation.  
- U‑Net definition in PyTorch.  
- Training loop with AMP + cosine scheduler.  
- Evaluation and visualization of training curves and predictions.  

To export weights:

```python
torch.save(model.state_dict(), "unet_brats_slices_dice_0.8.pth")
```

Then copy the `.pth` file into `backend/models/best_unet_brats_slices.pth`.

---

## 🚀 Uniqueness

Most student projects on brain tumor detection perform **binary classification** (tumor vs. no‑tumor) on small 2D datasets and stop at a notebook.
TumorTrace is different because it:

- Uses **BraTS2020**, a clinically relevant, multi‑modal benchmark.  
- Performs **multi‑class segmentation** (edema, necrotic core, enhancing tumor) at pixel level.  
- Provides a **fully integrated stack**: model training → FastAPI service → React UI aimed at radiologists.  
- Produces **interpretable TumorTrace reports** with overlays and quantitative stats, not just a “yes/no” label.

---

## 📌 Future Work

- Extend from 2D slice‑wise segmentation to full 3D volumes.  
- Explore lightweight U‑Net variants and attention modules for faster inference on low‑end hardware.  
- Improve domain generalization to handle MRIs from different hospitals and scanners.  
- Add uncertainty estimation / confidence maps to highlight regions where the model is less certain.

---

## 📝 License

Add your preferred license here, for example:

```text
MIT License
Copyright (c) 2026 …
```

---

## 🙌 Acknowledgements

- BraTS2020 organizers and contributors for providing the dataset.  
- Kaggle for GPU resources during training.  
- FastAPI, React, Vite and Tailwind communities for the tooling that made this project possible.
