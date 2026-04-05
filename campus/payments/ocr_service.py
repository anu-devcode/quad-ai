import cv2
import pytesseract
import re
import numpy as np
import os
from datetime import datetime
from decimal import Decimal
from pathlib import Path

try:
    from PyPDF2 import PdfReader
except ImportError:  # pragma: no cover - optional dependency
    PdfReader = None


def _configure_tesseract_binary():
    """Best-effort tesseract binary discovery for Windows and local envs."""
    env_cmd = os.getenv('TESSERACT_CMD')
    if env_cmd and Path(env_cmd).exists():
        pytesseract.pytesseract.tesseract_cmd = env_cmd
        return

    candidate_paths = [
        Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe"),
        Path(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"),
    ]

    for candidate in candidate_paths:
        if candidate.exists():
            pytesseract.pytesseract.tesseract_cmd = str(candidate)
            return


_configure_tesseract_binary()

class OCRService:
    SOURCE_CONFIDENCE_SCORE = {
        'sms': 0.95,
        'pdf': 0.90,
        'screenshot': 0.70,
        'manual': 0.60,
    }

    @staticmethod
    def preprocess_image(image_path):
        """Pre-processes image for better OCR accuracy."""
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        # Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Thresholding (Otsu's Binarization)
        _, thresholded = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Deskewing (Simple version)
        coords = np.column_stack(np.where(thresholded > 0))
        if coords.size == 0:
            return thresholded
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        (h, w) = thresholded.shape[:2]
        center = (w // 2, h // 2)
        M = cv2.getRotationMatrix2D(center, angle, 1.0)
        deskewed = cv2.warpAffine(thresholded, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        return deskewed

    @staticmethod
    def extract_text(processed_image):
        """Extracts text from processed image using Tesseract."""
        # Convert back to PIL for Tesseract if needed, or pass numpy array
        return pytesseract.image_to_string(processed_image)

    @staticmethod
    def extract_text_from_pdf(pdf_path):
        """Best-effort text extraction for PDF uploads."""
        if PdfReader is None:
            return ""

        reader = PdfReader(pdf_path)
        extracted_pages = []
        for page in reader.pages:
            extracted_pages.append(page.extract_text() or "")
        return "\n".join(extracted_pages)

    @staticmethod
    def parse_transaction_data(raw_text):
        """
        Parses raw text to find:
        - Amount (Decimal)
        - Date/Time (Datetime)
        - Transaction Type (Sent/Received)
        """
        data = {
            'amount': None,
            'purchase_time': None,
            'transaction_type': 'manual', # Default
            'user_id': None,
            'device_id': None,
            'ip_address': None,
            'validation_score': 0.0,
            'parsing_success': False,
            'parsing_success_score': 0.0,
        }

        # Prioritize labeled purchase values before generic numeric fallbacks.
        amount_match = None
        amount_patterns = [
            r'\bpurchase[_\s-]?value\s*[:=]\s*(?:KES|USD|RWF|ST|S|\$)?\s*([\d,]+\.?\d*)',
            r'\b(?:amount|total|amt)\s*[:=]\s*(?:KES|USD|RWF|ST|S|\$)?\s*([\d,]+\.?\d*)',
            r'(?:KES|USD|RWF|ST|S|\$)\s*([\d,]+\.?\d*)',
        ]
        for pattern in amount_patterns:
            amount_match = re.search(pattern, raw_text, re.IGNORECASE)
            if amount_match:
                break

        if not amount_match:
            amount_match = re.search(r'\b(\d{1,3}(?:,\d{3})*(?:\.\d{2})|\d+\.\d{2})\b', raw_text)

        if amount_match:
            try:
                amt_str = amount_match.group(1).replace(',', '')
                data['amount'] = Decimal(amt_str)
                data['validation_score'] += 0.4
            except:
                pass

        # Parse transaction type keywords
        txn_type_match = re.search(r'\b(sent|received|debited|credited|purchase|payment)\b', raw_text, re.IGNORECASE)
        if txn_type_match:
            data['transaction_type'] = txn_type_match.group(1).lower()
            data['validation_score'] += 0.1

        user_match = re.search(r'\buser[_\s-]?id\s*[:=]?\s*(\d+)\b', raw_text, re.IGNORECASE)
        if user_match:
            data['user_id'] = int(user_match.group(1))
            data['validation_score'] += 0.1

        device_match = re.search(r'\bdevice[_\s-]?id\s*[:=]?\s*([A-Za-z0-9_-]+)\b', raw_text, re.IGNORECASE)
        if device_match:
            data['device_id'] = device_match.group(1)
            data['validation_score'] += 0.1

        ip_match = re.search(r'\b((?:\d{1,3}\.){3}\d{1,3})\b', raw_text)
        if not ip_match:
            ip_match = re.search(r'\bip[_\s-]?address\s*[:=]?\s*(\d+)\b', raw_text, re.IGNORECASE)
        if ip_match:
            data['ip_address'] = ip_match.group(1)
            data['validation_score'] += 0.1

        # Regex for Date (supports full datetime and date-only fallbacks)
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})', # 2024-04-03 12:30:45
            r'(\d{4}-\d{2}-\d{2})', # 2024-04-03
            r'(\d{2}/\d{2}/\d{4})', # 03/04/2024
            r'(\d{2}-\d{2}-\d{4})', # 03-04-2024
        ]
        for pattern in date_patterns:
            date_match = re.search(pattern, raw_text)
            if date_match:
                try:
                    candidate = date_match.group(1).replace('T', ' ')
                    if ' ' in candidate and ':' in candidate:
                        data['purchase_time'] = datetime.strptime(candidate, '%Y-%m-%d %H:%M:%S')
                    elif '-' in candidate and len(candidate) == 10 and candidate[0:4].isdigit():
                        data['purchase_time'] = datetime.strptime(candidate, '%Y-%m-%d')
                    else:
                        data['purchase_time'] = datetime.strptime(candidate.replace('/', '-'), '%d-%m-%Y')
                    data['validation_score'] += 0.3
                    break
                except:
                    continue

        if data['amount'] and data['purchase_time']:
            data['parsing_success'] = True

        data['validation_score'] = min(max(data['validation_score'], 0.0), 1.0)
        data['parsing_success_score'] = data['validation_score']

        return data

    @classmethod
    def process(cls, image_path):
        """Complete pipeline."""
        processed = cls.preprocess_image(image_path)
        if processed is None:
            return None
        
        raw_text = cls.extract_text(processed)
        parsed_data = cls.parse_transaction_data(raw_text)
        parsed_data['raw_text'] = raw_text
        
        return parsed_data

    @classmethod
    def process_document(cls, file_path):
        """Process a screenshot image or PDF file."""
        suffix = Path(file_path).suffix.lower()
        if suffix == ".pdf":
            raw_text = cls.extract_text_from_pdf(file_path)
            if raw_text.strip():
                parsed_data = cls.parse_transaction_data(raw_text)
                parsed_data['raw_text'] = raw_text
                return parsed_data

        return cls.process(file_path)
