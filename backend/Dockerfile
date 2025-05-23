FROM ghcr.io/osgeo/gdal:ubuntu-small-3.11.0

EXPOSE 8000

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV TZ=America/Lima

RUN apt-get update && \
    apt-get -y install python3-pip libpq-dev ffmpeg libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade --break-system-packages -r /app/requirements.txt

COPY . /app/

CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]