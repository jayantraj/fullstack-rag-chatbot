# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Run the FastAPI application using Uvicorn
CMD ["uvicorn", "main_websockets:app", "--host", "0.0.0.0", "--port", "8000"]

# Expose port 8000 for the API
EXPOSE 8000
