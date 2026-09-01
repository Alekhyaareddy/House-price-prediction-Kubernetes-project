# House Price Prediction Kubernetes Project

## Project Overview

This project predicts house prices using a Machine Learning model deployed with Kubernetes.

The application includes:

- React frontend
- Flask backend
- Machine Learning model
- Docker containers
- Kubernetes deployments
- Nginx reverse proxy

---

## Features

- House price prediction
- Dataset statistics
- Interactive frontend
- Kubernetes deployment
- Dockerized architecture

---

## Tech Stack

### Frontend
- React
- Vite
- Nginx

### Backend
- Flask
- Scikit-learn
- Pandas
- NumPy

### DevOps
- Docker
- Kubernetes
- Minikube

---

## Kubernetes Architecture

Browser
↓
Frontend Service (NodePort)
↓
Frontend Pod (React + Nginx)
↓
Backend Service (ClusterIP)
↓
Backend Pod (Flask API)
↓
ML Model

---

## Kubernetes Components

### Deployments
- backend-deployment
- frontend-deployment

### Services
- backend-service
- frontend-service

---

## Run Project

### Start Minikube

```bash
minikube start
```

### Apply Kubernetes Files

```bash
kubectl apply -f k8s/
```

### Open Frontend

```bash
minikube service frontend-service
```

---

## Useful Commands

```bash
kubectl get pods
kubectl get services
kubectl logs deployment/frontend-deployment
kubectl logs deployment/backend-deployment
```

---

## Author

Alekhya
# GitHub Webhook Test
