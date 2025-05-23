FROM ghcr.io/osgeo/gdal:ubuntu-small-3.11.0

EXPOSE 8000

ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE=1

# Set the timezone environment variable
ENV TZ=America/Lima

# Update and install dependencies
RUN apt-get update
RUN apt-get -y install python3-pip
RUN apt-get -y install libpq-dev
RUN apt-get -y install ffmpeg libsm6 libxext6

WORKDIR /app

# Install python dependencies
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . /app/

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]