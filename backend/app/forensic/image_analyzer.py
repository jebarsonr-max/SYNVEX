import io
import os
from typing import Dict, Any, List, Tuple
from PIL import Image, ImageChops, ImageEnhance, ExifTags

def validate_image_signature(file_bytes: bytes) -> Tuple[bool, str]:
    """
    Validates magic bytes for JPEG, PNG, and WebP.
    """
    if len(file_bytes) < 12:
        return False, "File too small to determine image signature"
    
    # JPEG magic: FF D8 FF
    if file_bytes.startswith(b'\xff\xd8\xff'):
        return True, "image/jpeg"
    # PNG magic: 89 50 4E 47 0D 0A 1A 0A
    if file_bytes.startswith(b'\x89PNG\r\n\x1a\n'):
        return True, "image/png"
    # WebP magic: RIFF....WEBP
    if file_bytes.startswith(b'RIFF') and file_bytes[8:12] == b'WEBP':
        return True, "image/webp"
    
    return False, "Unsupported or non-image file signature"

def compute_error_level_analysis(img: Image.Image, quality: int = 90) -> Dict[str, Any]:
    """
    Computes Error Level Analysis (ELA) by recompressing at a known quality level
    and measuring pixel variance. High localized variance often indicates digital tampering.
    """
    try:
        # Convert to RGB if needed
        rgb_img = img.convert('RGB')
        
        # Save temporary in-memory JPEG at target quality
        buffer = io.BytesIO()
        rgb_img.save(buffer, 'JPEG', quality=quality)
        buffer.seek(0)
        
        recompressed = Image.open(buffer)
        
        # Calculate pixel difference
        diff = ImageChops.difference(rgb_img, recompressed)
        
        # Calculate statistics
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        
        # Calculate mean error level
        stat = diff.convert('L')
        hist = stat.histogram()
        total_pixels = sum(hist)
        weighted_sum = sum(i * count for i, count in enumerate(hist))
        mean_ela = weighted_sum / max(total_pixels, 1)

        return {
            "max_difference": max_diff,
            "mean_ela_error": round(mean_ela, 3),
            "compression_quality_tested": quality,
            "tamper_indicator": "HIGH" if mean_ela > 12.0 else "MEDIUM" if mean_ela > 6.0 else "LOW"
        }
    except Exception as e:
        return {
            "error": str(e),
            "tamper_indicator": "UNKNOWN"
        }

def extract_image_forensics(file_bytes: bytes) -> Dict[str, Any]:
    """
    Performs complete forensic decoding, EXIF metadata extraction, and structural analysis.
    """
    is_valid_sig, detected_mime = validate_image_signature(file_bytes)
    if not is_valid_sig:
        return {
            "valid": False,
            "error": detected_mime
        }

    try:
        img = Image.open(io.BytesIO(file_bytes))
        width, height = img.size
        img_format = img.format
        mode = img.mode

        # Extract EXIF tags safely
        exif_data = {}
        raw_exif = getattr(img, '_getexif', lambda: None)()
        if raw_exif:
            for tag_id, value in raw_exif.items():
                tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
                # Convert complex binary/bytes values to readable string representation
                if isinstance(value, bytes):
                    try:
                        exif_data[tag_name] = value.decode('utf-8', errors='ignore').strip()
                    except Exception:
                        exif_data[tag_name] = f"<{len(value)} bytes binary>"
                elif isinstance(value, (int, float, str)):
                    exif_data[tag_name] = value
                else:
                    exif_data[tag_name] = str(value)

        # Structural ELA analysis
        ela_metrics = compute_error_level_analysis(img)

        # Check for presence of AI / Synthetic software signatures in EXIF or metadata
        suspicious_software_found = False
        software_field = exif_data.get("Software", "")
        ai_software_signatures = ["Midjourney", "Stable Diffusion", "DALL-E", "Photoshop", "GIMP", "ComfyUI", "Automatic1111"]
        detected_software = []
        for sig in ai_software_signatures:
            if sig.lower() in software_field.lower():
                suspicious_software_found = True
                detected_software.append(sig)

        return {
            "valid": True,
            "mime_type": detected_mime,
            "format": img_format,
            "dimensions": {"width": width, "height": height},
            "color_mode": mode,
            "aspect_ratio": round(width / max(height, 1), 3),
            "has_exif": bool(exif_data),
            "exif_metadata": exif_data,
            "camera_make": exif_data.get("Make"),
            "camera_model": exif_data.get("Model"),
            "software": software_field,
            "detected_editing_software": detected_software,
            "ela_structural_analysis": ela_metrics
        }
    except Exception as e:
        return {
            "valid": False,
            "error": f"Corrupt image or decoding failed: {str(e)}"
        }
