#!/bin/bash

echo "Run as root or with sudo."

# Check for sed command
if command -v sed > /dev/null; then
  echo "sed is already installed."
else
  # Download and install sed for Linux
  echo "Downloading sed..."
  wget -O /tmp/sed-4.8.tar.gz "https://ftp.gnu.org/gnu/sed/sed-4.8.tar.gz"
  tar -xvf /tmp/sed-4.8.tar.gz -C /tmp/
  pushd /tmp/sed-4.8/ && ./configure && make && make install && popd
  echo "sed installed successfully."
fi

# Check for jq command
if command -v jq > /dev/null; then
  echo "jq is already installed."
else
  # Download and install jq for Linux
  echo "Downloading jq..."
  wget -O /usr/bin/jq "https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64"
  chmod +x /usr/bin/jq
  echo "jq installed successfully."
fi

# Check for 7-Zip command
if command -v 7z > /dev/null; then
  echo "7-Zip is already installed."
else
  # Install 7-Zip using the package manager
  echo "Installing 7-Zip..."
  apt-get install p7zip-full -y
  echo "7-Zip installed successfully."
fi

echo "Prerequisites installed successfully."
