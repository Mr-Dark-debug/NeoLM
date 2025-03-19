import logging

logger = logging.getLogger("NotebookLM")
logger.setLevel(logging.INFO)

# Define the log format
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

# File handler for logging to app.log
fh = logging.FileHandler("app.log")
fh.setFormatter(formatter)
logger.addHandler(fh)

# Stream handler for logging to console
sh = logging.StreamHandler()
sh.setFormatter(formatter)
logger.addHandler(sh)