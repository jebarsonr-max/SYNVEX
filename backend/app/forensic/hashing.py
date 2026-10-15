import hashlib
from typing import BinaryIO, Union

def calculate_sha256(file_input: Union[bytes, BinaryIO]) -> str:
    """
    Computes cryptographic SHA-256 hash of file bytes or a file-like stream.
    """
    hasher = hashlib.sha256()
    if isinstance(file_input, bytes):
        hasher.update(file_input)
    else:
        # Stream in 64KB chunks to maintain safe memory footprint
        file_input.seek(0)
        while chunk := file_input.read(65536):
            hasher.update(chunk)
        file_input.seek(0)
    return hasher.hexdigest()
