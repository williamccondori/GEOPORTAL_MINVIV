FROM osgeo/gdal:alpine-small-3.6.3
EXPOSE 8000
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV TZ=America/Lima

# Instalar dependencias con apk (gestor de paquetes de Alpine)
RUN apk update && apk add --no-cache \
    python3 \
    python3-dev \
    py3-pip \
    postgresql-dev \
    gcc \
    g++ \
    musl-dev \
    linux-headers \
    ffmpeg

WORKDIR /app
COPY ./requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

COPY . /app/
CMD ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]