#!/bin/bash
conda create -y -n tissuumaps-env -c conda-forge python=3.9
conda activate tissuumaps-env
conda install -y -c conda-forge pyqt libvips
pip install “tissuumaps[full]”

# if not already, git clone the modified repo.
git clone https://github.com/arundasan91/TissUUmaps.git
cd TissUUmaps
pip install --upgrade -e .
