# Bastion IaC (Generation 2): Ansible for Project Bastion Infrastructure

This repository contains the complete Ansible project to provision, configure, and maintain the Raspberry Pi cluster that powers **Project Bastion**. It uses a professional "Infrastructure as Code" (IaC) approach to ensure the entire self-hosted factory is reproducible, documented, and defined as code.

This "Generation 2" architecture has been re-engineered to isolate resource-intensive workloads and provide a stable, high-performance platform for all core services.

---
## Final Architecture

This project configures a three-node Raspberry Pi cluster with distinct, purpose-built roles.

*   **Core Services Hub (`pi5-control`):** A Raspberry Pi 5 that runs the primary, persistent services.
    *   **Services:** Gitea, MinIO, Docker Registry, Nginx Proxy Manager, Nginx Web Server, Authentik.

*   **Intelligence & Analysis Node (`pi4-intel`):** An 8GB Raspberry Pi 4B dedicated to the most memory-intensive application.
    *   **Services:** OpenCTI.

*   **Management & Automation Node (`pi4-mgmt`):** A Raspberry Pi 4B for high-level management and DNS services.
    *   **Services:** Portainer, Pi-hole.

---
## Configuration: The `group_vars` System

Configuration is handled automatically by Ansible's `group_vars` system.

1.  **`inventory/hosts.ini`:** Defines your cluster layout. You **must** edit this file to set the real static IPs of your Raspberry Pis.

2.  **`group_vars/all.yml` (Encrypted):** Contains all sensitive passwords and API keys. Create it with `ansible-vault create group_vars/all.yml`.

3.  **`group_vars/pi_cluster.yml` (Non-Sensitive):** Contains all non-sensitive variables (paths, URLs, usernames). Edit this file to set the correct IP addresses for your service URLs.

---
## One-Time Manual Bootstrap Process

Before Ansible can manage a new Raspberry Pi, it must be manually bootstrapped once.

1.  **Flash OS:** Flash the latest 64-bit Raspberry Pi OS Lite.
2.  **Enable SSH:** Create an empty file named `ssh` in the `boot` partition.
3.  **First Boot & IP:** Boot the Pi and assign it a static IP on your router.
4.  **Create Admin User:** `ssh pi@<ip-address>`, then run `sudo adduser pi_admin && sudo usermod -aG sudo pi_admin`.
5.  **SSH Key Exchange:** From your Mac, run `ssh-copy-id pi_admin@<ip-address>`.
6.  **Disable `pi` user:** `sudo passwd -l pi`.

---
## Execution

### 1. Configuring the Raspberry Pi Cluster
Run the master `site.yml` playbook to configure the entire cluster.
```bash
# From the root of this project:
ansible-playbook -i inventory/hosts.ini site.yml --ask-vault-pass
```
### 2. Deploying the Local Drone Runner (MacBook Pro)
Run the dedicated deploy-runner.yml playbook to install the CI/CD runner on your Mac.

```bash
# Prerequisite: Docker Desktop must be running on your Mac.
ansible-playbook -i inventory/local.ini deploy-runner.yml --ask-vault-pass
```
## Deployed Services Quick Reference
Access to all services is managed via the Nginx Proxy Manager and Pi-hole DNS. After deployment, log in to the Nginx Proxy Manager admin UI (http://<IP_of_Pi5>:81) and create "Proxy Hosts" to map the hostnames below to their respective containers. Then, add these hostnames to your Pi-hole's "Local DNS Records".

- Gitea (Git): http://gitea.local

- MinIO (Artifacts): http://minio.local

- Authentik (IAM/SSO): http://auth.local

- OpenCTI (Threat Intel): http://opencti.local

- Portainer (Management): https://portainer.local

- Pi-hole (DNS/Ad-block): http://pihole.local/admin

- Static Website: http://www.local
