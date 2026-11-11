import sys
import os

# Ensure app is discoverable when running pytest tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
