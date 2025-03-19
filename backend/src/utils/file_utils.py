import os
from src.utils.logging import logger

def cleanup_temp_dir(temp_dir: str) -> None:
    """
    Remove all files in the temporary directory and then the directory itself.
    
    Args:
        temp_dir (str): Path to the temporary directory.
    """
    try:
        if os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, file)
                if os.path.isfile(file_path):
                    os.remove(file_path)
                    logger.info(f"Removed temporary file: {file_path}")
            os.rmdir(temp_dir)
            logger.info(f"Removed temporary directory: {temp_dir}")
    except Exception as e:
        logger.error(f"Failed to clean up {temp_dir}: {str(e)}")

def validate_file_path(file_path: str) -> bool:
    """
    Check if a file path is valid and exists.
    
    Args:
        file_path (str): Path to the file.
    
    Returns:
        bool: True if the file exists and is a file, False otherwise.
    """
    if not isinstance(file_path, str):
        logger.error(f"Invalid file path type: {type(file_path)}")
        return False
    if not os.path.exists(file_path):
        logger.warning(f"File does not exist: {file_path}")
        return False
    if not os.path.isfile(file_path):
        logger.warning(f"Path is not a file: {file_path}")
        return False
    return True

def ensure_directory(directory: str) -> None:
    """
    Ensure a directory exists, creating it if necessary.
    
    Args:
        directory (str): Path to the directory.
    """
    try:
        os.makedirs(directory, exist_ok=True)
        logger.debug(f"Ensured directory exists: {directory}")
    except Exception as e:
        logger.error(f"Failed to create directory {directory}: {str(e)}")
        raise