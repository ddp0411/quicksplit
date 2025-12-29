# Preprocessing script for dataset
import os
import json
from PIL import Image
from pathlib import Path


def preprocess_images(input_dir: str, output_dir: str):
    """Preprocess images for training."""
    os.makedirs(output_dir, exist_ok=True)
    
    for filename in os.listdir(input_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            img_path = os.path.join(input_dir, filename)
            img = Image.open(img_path)
            
            # Resize and normalize
            img = img.resize((800, 600))
            
            # Save processed image
            output_path = os.path.join(output_dir, filename)
            img.save(output_path)
    
    print(f"Processed images saved to {output_dir}")


if __name__ == "__main__":
    raw_dir = "../raw/images"
    processed_dir = "../processed/normalized"
    preprocess_images(raw_dir, processed_dir)

