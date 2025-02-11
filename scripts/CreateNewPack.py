import json
import os
import shutil
import tempfile
import zipfile
import datetime
import logging
import jsmin
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def read_config(config_path):
    """Read version and name from config.json"""
    try:
        with open(config_path, 'r') as f:
            data = json.load(f)
            return data.get('version'), data.get('name')
    except FileNotFoundError:
        logger.error(f"{config_path} file not found")
        return None, None
    except json.JSONDecodeError:
        logger.error("Invalid JSON in config file")
        return None, None

def create_temp_dir():
    """Create a temporary directory"""
    return tempfile.mkdtemp()

def copy_source_files(source_dir, dest_dir):
    """Copy source files to destination directory"""
    try:
        shutil.copytree(source_dir, dest_dir)
        logger.info(f"Copied files from {source_dir} to {dest_dir}")
    except FileExistsError:
        logger.warning(f"Destination {dest_dir} already exists, overwriting...")
        shutil.rmtree(dest_dir)
        shutil.copytree(source_dir, dest_dir)
    except Exception as e:
        logger.error(f"Error copying files: {e}")
        raise

def update_manifest(manifest_path, version):
    """Update version in manifest.json"""
    try:
        with open(manifest_path, 'r+') as f:
            data = json.load(f)
            data['version'] = version
            f.seek(0)
            json.dump(data, f, indent=2)
            f.truncate()
        logger.info(f"Updated manifest at {manifest_path}")
    except Exception as e:
        logger.error(f"Error updating manifest: {e}")
        raise

def update_popup_html(popup_path, version, release_date):
    """Update version and release date in popup.html"""
    try:
        with open(popup_path, 'r+') as f:
            content = f.read()
            # Replace the version and release date
            updated_content = content.replace(
                '<h2>Version .* - Released .*</h2>',
                f'<h2>Version {version} - Released {release_date}</h2>'
            )
            f.seek(0)
            f.write(updated_content)
            f.truncate()
        logger.info(f"Updated popup.html at {popup_path}")
    except Exception as e:
        logger.error(f"Error updating popup.html: {e}")
        raise

def minify_javascript(js_path):
    """Minify JavaScript files using jsmin"""
    try:
        
        with open(js_path, 'r+') as f:
            content = f.read()
            minified = jsmin.jsmin(content)
            f.seek(0)
            f.write(minified)
            f.truncate()
        logger.info(f"Minified {js_path}")
    except Exception as e:
        logger.error(f"Error minifying {js_path}: {e}")
        raise

def create_zip_archive(source_dir, zip_path):
    """Create a zip file from source directory"""
    try:
        with zipfile.ZipFile(zip_path, 'w') as zip_file:
            for root, dirs, files in os.walk(source_dir):
                for file in files:
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, source_dir)
                    zip_file.write(file_path, rel_path)
        logger.info(f"Created zip file at {zip_path}")
    except Exception as e:
        logger.error(f"Error creating zip file: {e}")
        raise

def extract_zip(zip_path, dest_dir):
    """Extract zip file to destination directory"""
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_file:
            zip_file.extractall(dest_dir)
        logger.info(f"Extracted zip to {dest_dir}")
    except Exception as e:
        logger.error(f"Error extracting zip: {e}")
        raise

def main():
    # Read config
    config_path = 'package.json'
    version, name = read_config(config_path)
    if not version or not name:
        logger.error("Failed to read version or name from config")
        return

    # Create temp dir
    temp_dir = create_temp_dir()
    logger.info(f"Created temp dir at {temp_dir}")

    # Copy source files
    source_dir = os.path.join(os.path.dirname(config_path), 'src')
    dest_dir = os.path.join(temp_dir, 'src')
    copy_source_files(source_dir, dest_dir)

    # Update manifest
    manifest_path = os.path.join(dest_dir, 'manifest.json')
    update_manifest(manifest_path, version)

    # Update popup.html
    popup_path = os.path.join(dest_dir, 'popup.html')
    release_date = datetime.datetime.now().strftime('%Y-%m-%d')
    update_popup_html(popup_path, version, release_date)

    # Minify JavaScript files
    for root, dirs, files in os.walk(dest_dir):
        for file in files:
            if file.endswith('.js'):
                js_path = os.path.join(root, file)
                minify_javascript(js_path)

    # Create zip file
    zip_name = f"{name}_{version}.zip"
    zip_path = os.path.join(os.path.dirname(config_path), 'dist', zip_name)
    os.makedirs(os.path.dirname(zip_path), exist_ok=True)
    create_zip_archive(dest_dir, zip_path)

    # Extract zip to dist
    extract_zip(zip_path, os.path.join(os.path.dirname(config_path), 'dist'))

    # Cleanup
    shutil.rmtree(temp_dir)
    logger.info("Cleaned up temporary directory")

if __name__ == "__main__":
    main()
