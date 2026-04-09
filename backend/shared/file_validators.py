"""Validadores compartidos para archivos subidos."""
import os

ALLOWED_EXTENSIONS = {'.pdf', '.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


def validate_uploaded_file(archivo):
    """
    Valida extensión y tamaño del archivo subido.
    Retorna None si es válido, o un string con el error.
    """
    if not archivo:
        return 'archivo es requerido.'

    ext = os.path.splitext(archivo.name)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return f'Tipo de archivo no permitido ({ext}). Solo se aceptan: {", ".join(sorted(ALLOWED_EXTENSIONS))}'

    if archivo.size > MAX_FILE_SIZE:
        return f'El archivo excede el tamaño máximo permitido ({MAX_FILE_SIZE // (1024 * 1024)} MB).'

    return None
