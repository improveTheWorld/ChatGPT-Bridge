import os
import sys
import json
import shutil
import re
import tempfile
import datetime
import zipfile
import subprocess
from jsmin import jsmin

def main():
    # Get current working directory
    cwd = os.getcwd()

    # Path to package.json
    package_json_path = os.path.abspath(os.path.join(cwd, '..', 'package.json'))

    # Read package.json
    try:
        with open(package_json_path, 'r', encoding='utf-8') as f:
            package_data = json.load(f)
    except Exception as e:
        print(f"Error reading package.json: {e}")
        sys.exit(1)

    # Get VERSION and NAME
    VERSION = package_data.get('version')
    NAME = package_data.get('name')
    SOURCE = os.path.abspath(os.path.join(cwd, '..', 'src'))

    # Check if VERSION and SOURCE are set
    if not VERSION:
        print("Version not found in package.json")
        sys.exit(1)
    if not os.path.exists(SOURCE):
        print("Source directory not found")
        sys.exit(1)

    # Create temporary folder
    temp_dir_base = os.path.join(tempfile.gettempdir(), f"{NAME}_{VERSION}")
    TEMP_DIR = temp_dir_base

    # If temp directory exists, delete it
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)

    # Create temp directory
    os.makedirs(TEMP_DIR)

    # Copy source folder to temp directory
    try:
        shutil.copytree(SOURCE, TEMP_DIR, dirs_exist_ok=True)
    except Exception as e:
        print(f"Error copying source to temp directory: {e}")
        sys.exit(1)

    # Update version in manifest.json
    manifest_path = os.path.join(TEMP_DIR, 'manifest.json')
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, 'r', encoding='utf-8') as f:
                manifest_data = json.load(f)
            manifest_data['version'] = VERSION
            with open(manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, indent=2)
        except Exception as e:
            print(f"Error updating manifest.json: {e}")
            sys.exit(1)
    else:
        print("manifest.json not found in temp directory")
        sys.exit(1)

    # Update version in popup.html
    popup_file_path = os.path.join(TEMP_DIR, 'popup.html')
    RELEASE_DATE = datetime.datetime.now().strftime('%Y-%m-%d')
    if os.path.exists(popup_file_path):
        try:
            with open(popup_file_path, 'r', encoding='utf-8') as f:
                popup_content = f.read()
            # Use regex to replace the version and release date in the h2 tag
            popup_content_new = re.sub(
                r'<h2>Version .* - Released .*</h2>',
                f'<h2>Version {VERSION} - Released {RELEASE_DATE}</h2>',
                popup_content
            )
            with open(popup_file_path, 'w', encoding='utf-8') as f:
                f.write(popup_content_new)
        except Exception as e:
            print(f"Error updating popup.html: {e}")
            sys.exit(1)
    else:
        print("popup.html not found in temp directory")
        sys.exit(1)

    # Apply minification
    for root, dirs, files in os.walk(TEMP_DIR):
        for file in files:
            if file.endswith('.js'):
                js_file_path = os.path.join(root, file)
                try:
                    with open(js_file_path, 'r', encoding='utf-8') as f:
                        js_content = f.read()

                    # Minify with jsmin
                    minified_js = jsmin(js_content)
                    with open(js_file_path, 'w', encoding='utf-8') as f:
                        f.write(minified_js)

                    # Optional: Validate syntax using Node.js
                    subprocess.run(["node", "-c", js_file_path], check=True)

                    print(f"Minified and validated: {js_file_path}")
                except Exception as e:
                    print(f"Error processing {js_file_path}: {e}")

    # Create zip file with version name
    dist_dir = os.path.abspath(os.path.join(cwd, '..', 'dist'))
    if not os.path.exists(dist_dir):
        os.makedirs(dist_dir)
    ZIP_NAME = f"{NAME}_{VERSION}.zip"
    zip_file_path = os.path.join(dist_dir, ZIP_NAME)

    print("Creating zip file...")

    try:
        with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(TEMP_DIR):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, TEMP_DIR)
                    zipf.write(file_path, arcname)
    except Exception as e:
        print(f"Error creating zip file: {e}")
        sys.exit(1)

    print(f"The zip file has been created at: {zip_file_path}")

    # Cleanup
    shutil.rmtree(TEMP_DIR)

if __name__ == '__main__':
    main()
