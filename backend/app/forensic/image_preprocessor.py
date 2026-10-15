import io
import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from typing import Tuple, Dict, Any

# Standard computer vision normalization parameters
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

def get_image_transforms(target_size: Tuple[int, int] = (224, 224)) -> transforms.Compose:
    return transforms.Compose([
        transforms.Resize(target_size, interpolation=transforms.InterpolationMode.BICUBIC),
        transforms.ToTensor(),
        transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
    ])

def preprocess_image_bytes(file_bytes: bytes, target_size: Tuple[int, int] = (224, 224)) -> Tuple[torch.Tensor, np.ndarray, Dict[str, Any]]:
    """
    Decodes image bytes, ensures RGB format, computes transform tensor,
    and returns tensor, raw RGB numpy array, and dimension metadata.
    """
    image = Image.open(io.BytesIO(file_bytes)).convert('RGB')
    orig_w, orig_h = image.size
    
    transform_pipeline = get_image_transforms(target_size)
    tensor = transform_pipeline(image).unsqueeze(0)  # Shape: [1, 3, 224, 224]
    
    raw_np = np.array(image.resize(target_size))
    
    metadata = {
        "original_width": orig_w,
        "original_height": orig_h,
        "preprocessed_shape": list(tensor.shape),
        "mean_normalization": IMAGENET_MEAN,
        "std_normalization": IMAGENET_STD
    }
    
    return tensor, raw_np, metadata

def compute_2d_frequency_spectrum(rgb_np: np.ndarray) -> Dict[str, float]:
    """
    Computes 2D Fast Fourier Transform (FFT) / spectral distribution
    to detect synthetic generation frequency roll-offs and grid artifacts.
    """
    # Convert to grayscale luminance
    gray = 0.2989 * rgb_np[:, :, 0] + 0.5870 * rgb_np[:, :, 1] + 0.1140 * rgb_np[:, :, 2]
    
    # 2D FFT
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-9)
    
    # Compute high frequency ratio vs low frequency core
    h, w = gray.shape
    cy, cx = h // 2, w // 2
    r_core = min(h, w) // 6
    
    y, x = np.ogrid[:h, :w]
    mask_core = (x - cx)**2 + (y - cy)**2 <= r_core**2
    
    core_energy = np.mean(magnitude_spectrum[mask_core])
    outer_energy = np.mean(magnitude_spectrum[~mask_core])
    spectral_ratio = float(outer_energy / (core_energy + 1e-9))
    spectral_variance = float(np.var(magnitude_spectrum))

    return {
        "spectral_ratio": round(spectral_ratio, 4),
        "spectral_variance": round(spectral_variance, 2),
        "frequency_anomaly_detected": bool(spectral_ratio > 0.82 or spectral_ratio < 0.25)
    }
