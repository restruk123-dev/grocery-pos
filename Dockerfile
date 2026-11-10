# Dockerfile for GroceryStore POS
FROM python:3.12-slim

# Set up unprivileged user
RUN useradd -m -u 1000 user

# Configure environment
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PORT=8000 \
    PYTHONUNBUFFERED=1

# Create /data directory for persistent SQLite storage if needed
RUN mkdir -p /data && chown -R user:user /data

# Set working directory
WORKDIR $HOME/app

# Install dependencies first for layer caching
COPY --chown=user:user requirements.txt $HOME/app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r $HOME/app/requirements.txt

# Copy application files with appropriate ownership
COPY --chown=user:user . $HOME/app

# Switch to non-root user
USER user

# Expose standard port
EXPOSE 8000

# Start production server
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
