# Dataset tasks
from app.core.celery_app import celery_app
from app.services.dataset_service import upload_dataset_file
import zipfile
import os


@celery_app.task(name="process_dataset")
def process_dataset_task(filename: str, file_content: bytes):
    """Process dataset upload task asynchronously."""
    try:
        # Save uploaded file
        file_path = upload_dataset_file(filename, file_content)
        
        # Extract and process dataset
        extract_dir = os.path.join(os.path.dirname(file_path), "extracted")
        os.makedirs(extract_dir, exist_ok=True)
        
        with zipfile.ZipFile(file_path, 'r') as zip_ref:
            zip_ref.extractall(extract_dir)
        
        # Count images
        image_count = 0
        for root, dirs, files in os.walk(extract_dir):
            for file in files:
                if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    image_count += 1
        
        return {
            "status": "completed",
            "file_path": file_path,
            "extract_dir": extract_dir,
            "total_images": image_count,
        }
    except Exception as e:
        return {
            "status": "failed",
            "error": str(e),
        }

