# VoteHub

Aplikacja internetowa umożliwiająca tworzenie i przeprowadzanie ankiet oraz prezentowanie wyników głosowania.

Projekt został przygotowany w ramach zajęć dotyczących konteneryzacji i orkiestracji aplikacji z wykorzystaniem Kubernetes.

## Technologie

- Python
- Flask
- PostgreSQL
- Docker
- Kubernetes
- HTML, CSS, JavaScript

## Architektura

System składa się z dwóch głównych komponentów:

- **VoteHub** – aplikacja webowa uruchamiana w Kubernetes jako Deployment.
- **PostgreSQL** – baza danych uruchamiana jako StatefulSet z PersistentVolumeClaim.

Aplikacja komunikuje się z bazą danych za pośrednictwem wewnętrznego Service Kubernetes.

Dostęp do aplikacji realizowany jest przez Ingress z wykorzystaniem kontrolera NGINX.

## Zastosowane obiekty Kubernetes

- Deployment
- StatefulSet
- Service
- NetworkPolicy
- Ingress
- PersistentVolumeClaim
- ConfigMap
- Secret
- Resource Requests i Limits
- ResourceQuota
- LimitRange

## Struktura projektu

```text
VoteHub/
├── app/
│   ├── static/
│   ├── templates/
│   ├── __init__.py
│   ├── models.py
│   └── routes.py
├── kubernetes/
│   ├── app-configmap.yaml
│   ├── app-deployment.yaml
│   ├── app-service.yaml
│   ├── app-ingress.yaml
│   ├── postgres-service.yaml
│   ├── postgres-statefulset.yaml
│   ├── postgres-networkpolicy.yaml
│   ├── votehub-resourcequota.yaml
│   ├── votehub-limitrange.yaml
│   └── postgres-secret.example.yaml
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── run.py
```

## Uruchomienie

Projekt wykorzystuje lokalny obraz Docker:

```bash
docker build -t votehub:1.3 .
```

W przypadku Minikube obraz należy załadować do klastra:

```bash
minikube image load votehub:1.3
```

Manifesty Kubernetes znajdują się w katalogu `kubernetes/`.

Przed wdrożeniem należy utworzyć Secret na podstawie przykładowego manifestu i uzupełnić własne dane dostępowe.

## Testowane funkcjonalności

- Uruchomienie aplikacji w Kubernetes.
- Skalowanie Deploymentu.
- Automatyczne odtwarzanie Podów po ich usunięciu.
- Zachowanie danych po ponownym uruchomieniu Poda PostgreSQL.
- Dostęp do aplikacji za pośrednictwem Ingress.
- Ograniczanie zasobów za pomocą Requests, Limits, ResourceQuota i LimitRange.
- Separacja zasobów za pomocą namespace.

## Namespace

Główne wdrożenie projektu znajduje się w namespace:

```text
votehub
```

## Uwagi

Manifest Secret zawierający rzeczywiste dane dostępowe nie jest przechowywany w repozytorium. Zamiast niego znajduje się przykładowy manifest.
