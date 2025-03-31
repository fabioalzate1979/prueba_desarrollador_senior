#!/bin/bash

# Definir variables
PROJECT_ID="pruebadesarrollosenior"
IMAGE_NAME="prueba_desarrollador_senior"
REGION="us-central1"

# Autenticarse en Google Cloud (ejecuta solo una vez)
gcloud auth login
gcloud config set project $PROJECT_ID

# Construir la imagen Docker
docker build -t gcr.io/$PROJECT_ID/$IMAGE_NAME .

# Autenticar Docker con Google Cloud
gcloud auth configure-docker gcr.io

# Subir la imagen a Google Container Registry
docker push gcr.io/$PROJECT_ID/$IMAGE_NAME

# Desplegar en Cloud Run
gcloud run deploy $IMAGE_NAME \
  --image gcr.io/$PROJECT_ID/$IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --memory 512Mi \
  --cpu 1 \
  --allow-unauthenticated
