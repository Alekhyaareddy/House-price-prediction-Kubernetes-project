pipeline {
    agent any

    stages {

        stage('Clone Repository') {
            steps {
                git 'https://github.com/Alekhyaareddy/House-price-prediction-Kubernetes-project'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                bat 'docker build -t frontend-app ./frontend'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                bat 'docker build -t backend-app ./backend'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f k8s/'
            }
        }
    }
}