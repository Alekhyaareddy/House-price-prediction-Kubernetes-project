# Use Python base image
FROM python:3.11

# Set working directory
WORKDIR /app

# Copy all files
COPY . /app

# Install dependencies
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Expose port
EXPOSE 5000

# Run app
CMD ["gunicorn", "-b", "0.0.0.0:5000", "app:app"]