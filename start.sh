#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

# Activate the virtual environment
source pharma_env/bin/activate

# Open the app in the default browser after a short delay
( sleep 2 && open http://127.0.0.1:5000 ) &

# Run the Flask app
python3 app.py#!/bin/bash

# Navigate to the project directory (if not already there)
cd "$(dirname "$0")"

# Activate the virtual environment
source pharma_env/bin/activate

# Run the Flask app
python3 app.py
