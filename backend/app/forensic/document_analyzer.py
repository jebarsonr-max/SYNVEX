import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Tuple
from pypdf import PdfReader

def validate_pdf_signature(file_bytes: bytes) -> bool:
    return file_bytes.startswith(b'%PDF-')

def validate_docx_signature(file_bytes: bytes) -> bool:
    # DOCX is an OPC zip container starting with PK\x03\x04
    if not file_bytes.startswith(b'PK\x03\x04'):
        return False
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            return "[Content_Types].xml" in z.namelist()
    except Exception:
        return False

def extract_pdf_forensics(file_bytes: bytes) -> Dict[str, Any]:
    if not validate_pdf_signature(file_bytes):
        return {"valid": False, "error": "Invalid PDF magic byte signature"}

    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        num_pages = len(reader.pages)
        is_encrypted = reader.is_encrypted

        raw_meta = reader.metadata or {}
        metadata = {}
        for k, v in raw_meta.items():
            clean_k = str(k).lstrip('/')
            metadata[clean_k] = str(v)

        # Extract text samples and search for embedded URIs
        full_text = ""
        extracted_urls = set()
        url_regex = re.compile(r'https?://[^\s<>"]+|www\.[^\s<>"]+')

        for i, page in enumerate(reader.pages):
            try:
                page_text = page.extract_text() or ""
                full_text += f"\n--- Page {i+1} ---\n" + page_text
                for match in url_regex.finditer(page_text):
                    extracted_urls.add(match.group())

                # Also inspect annotations for link actions
                if "/Annots" in page:
                    annots = page["/Annots"]
                    if isinstance(annots, list):
                        for annot in annots:
                            annot_obj = annot.get_object() if hasattr(annot, 'get_object') else annot
                            if "/A" in annot_obj and "/URI" in annot_obj["/A"]:
                                extracted_urls.add(str(annot_obj["/A"]["/URI"]))
            except Exception:
                continue

        # Look for suspicious PDF indicators (JavaScript, Launch, OpenAction)
        has_js = False
        has_embedded_files = False
        if reader.trailer and "/Root" in reader.trailer:
            root = reader.trailer["/Root"]
            if "/Names" in root and "/JavaScript" in root["/Names"]:
                has_js = True
            if "/Names" in root and "/EmbeddedFiles" in root["/Names"]:
                has_embedded_files = True

        return {
            "valid": True,
            "format": "PDF",
            "page_count": num_pages,
            "is_encrypted": is_encrypted,
            "metadata": metadata,
            "creator": metadata.get("Creator"),
            "producer": metadata.get("Producer"),
            "creation_date": metadata.get("CreationDate"),
            "mod_date": metadata.get("ModDate"),
            "extracted_urls": list(extracted_urls)[:20],
            "has_javascript_indicator": has_js,
            "has_embedded_files": has_embedded_files,
            "text_preview": full_text[:1000].strip(),
            "full_extracted_text": full_text.strip()
        }
    except Exception as e:
        return {"valid": False, "error": f"Failed to parse PDF: {str(e)}"}

def extract_docx_forensics(file_bytes: bytes) -> Dict[str, Any]:
    if not validate_docx_signature(file_bytes):
        return {"valid": False, "error": "Invalid DOCX package format"}

    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes)) as z:
            namelist = z.namelist()
            metadata = {}
            if "docProps/core.xml" in namelist:
                core_xml = z.read("docProps/core.xml")
                root = ET.fromstring(core_xml)
                for child in root:
                    tag_name = child.tag.split('}')[-1]
                    if child.text:
                        metadata[tag_name] = child.text

            # Extract body text from word/document.xml
            text_chunks = []
            if "word/document.xml" in namelist:
                doc_xml = z.read("word/document.xml")
                root = ET.fromstring(doc_xml)
                for elem in root.iter():
                    if elem.tag.endswith('}t') and elem.text:
                        text_chunks.append(elem.text)
            
            full_text = " ".join(text_chunks)
            
            # Check for macros (.docm disguised or vbaProject.bin)
            has_macros = "word/vbaProject.bin" in namelist

            return {
                "valid": True,
                "format": "DOCX",
                "metadata": metadata,
                "creator": metadata.get("creator"),
                "last_modified_by": metadata.get("lastModifiedBy"),
                "created": metadata.get("created"),
                "modified": metadata.get("modified"),
                "has_macros_indicator": has_macros,
                "text_preview": full_text[:1000].strip(),
                "full_extracted_text": full_text.strip()
            }
    except Exception as e:
        return {"valid": False, "error": f"Failed to parse DOCX: {str(e)}"}
