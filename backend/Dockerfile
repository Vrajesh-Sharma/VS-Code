# =========================================================
# Base Image (lightweight + Python)
# =========================================================
FROM python:3.10-slim

# Prevent Python from writing pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory
WORKDIR /app

# =========================================================
# Install system dependencies
# =========================================================
RUN apt-get update && apt-get install -y \
    build-essential \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# =========================================================
# Install Python dependencies
# =========================================================
COPY backend/requirements.txt .

RUN pip install --no-cache-dir --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# =========================================================
# Copy entire backend
# =========================================================
COPY backend /app

# =========================================================
# Expose port (HF expects 7860)
# =========================================================
EXPOSE 7860

# =========================================================
# Start FastAPI using Uvicorn
# =========================================================
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]