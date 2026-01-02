# Reverse Nginx CI/CD Deployment on AWS EC2

A minimal CI/CD example that deploys a Dockerized Node.js stack behind Nginx (reverse proxy) on an AWS EC2 instance using GitHub Actions. This repository demonstrates an end-to-end workflow for automated builds and deployments to a single EC2 host using Docker Compose.

## Quick summary
- GitHub Actions triggers on pushes to `main`.
- Actions SSH into an EC2 instance to pull the repo and run Docker Compose.
- Services:
  - app1 — Node.js (port 3000)
  - app2 — Node.js (port 3001)
  - nginx — Reverse proxy (port 80)

## Why this setup
- Simple, low-cost approach for small services.
- Keeps routing and TLS termination centralized via Nginx.
- Easy to prototype CI/CD without complex orchestration platforms.

## Architecture (high level)
GitHub Actions → SSH → EC2 → Docker Compose
  ├─ app1 (Node.js)
  ├─ app2 (Node.js)
  └─ nginx (reverse proxy)

Traffic flow:
- External request → Nginx (80) → proxied to app1 or app2 based on path or host.

## Components
- Docker Compose orchestration (single file defining services).
- Node.js sample apps (app1, app2) exposing HTTP endpoints.
- Nginx configuration (reverse-proxy rules for /app1 and /app2).
- GitHub Actions workflow (SSH runner steps, deploy commands).

## Prerequisites
- AWS EC2 (Ubuntu) with Docker & Docker Compose installed.
- Security Group: allow SSH (22, restricted to your IP), HTTP (80). Optionally allow 3000/3001 for direct testing.
- GitHub secrets:
  - `EC2_SSH_KEY` — private key for EC2 (use proper permissions)
  - `EC2_HOST` — EC2 public IP or hostname
  - (optional) `EC2_USER` — default `ubuntu` or your EC2 username

## Detailed deployment (commands)
On EC2 (one-time):
- Install Docker & Compose:
  - sudo apt update && sudo apt install -y docker.io docker-compose
  - sudo usermod -aG docker $USER
- Ensure SSH key and Git are available.

Typical GitHub Actions workflow steps:
1. SSH to EC2:
   - mkdir -p /opt/reverse-nginx
   - cd /opt/reverse-nginx
2. Clone or update repo:
   - if [ ! -d .git ]; then git clone <repo> .; else git pull; fi
3. Build and run:
   - docker-compose down --remove-orphans
   - docker-compose up -d --build

## Validation & testing
- Check containers:
  - docker ps
- Health-check endpoints:
  - curl http://<EC2_PUBLIC_IP>/app1
  - curl http://<EC2_PUBLIC_IP>/app2
- Example:
  - curl -sS http://<EC2_PUBLIC_IP>/app1 | jq .

## Troubleshooting
- SSH failures: verify EC2_SSH_KEY, EC2_HOST, and security group rules.
- Docker permission errors: ensure `docker` group membership or use `sudo`.
- Containers not starting: check logs with `docker-compose logs --tail=200`.
- Nginx routing issues: test proxy targets directly (curl localhost:3000).

## Security considerations
- Keep SSH keys private and rotate regularly.
- Never store private keys in the repo.
- Consider enabling HTTPS (Let's Encrypt) and redirecting HTTP → HTTPS.
- Limit SSH access by source IP or use a bastion host.

## Logging & monitoring
- Add centralized logging (e.g., Filebeat / Fluentd) if scaling beyond a single VM.
- Expose health-check endpoints and use CloudWatch or Prometheus for metrics.

## Best practices & maintenance
- Use CI checks (lint, test) before deploying.
- Tag releases and use immutable image tags in production.
- Back up critical configurations and deployment scripts.

## Folder structure
/reverse-nginx
├── docker-compose.yml
├── app1/
│   └── index.js
├── app2/
│   └── index.js
└── nginx/
    └── reverse-proxy.conf

## Future enhancements
- Automated SSL with Let’s Encrypt (Certbot or reverse proxy container)
- Blue-green or canary deployments for zero downtime
- Move to a managed container service (ECS, EKS) for scaling and resilience
- Centralized logging and alerting

## Contributing
- Open an issue or PR for improvements.
- Keep changes small and document configuration updates.

<!-- end -->