# Bastion IaC (Generation 2): Ansible for Project Bastion Infrastructure

This repository contains the complete Ansible project to provision, configure, and maintain the Raspberry Pi cluster that powers **Project Bastion**. It uses a professional "Infrastructure as Code" (IaC) approach to ensure the entire self-hosted factory—not just the product—is reproducible, documented, and defined as code.

This "Generation 2" architecture is engineered to isolate resource-intensive workloads and provide a stable, high-performance platform for all core services.

---
## Final Architecture

This project configures a three-node Raspberry Pi cluster with distinct, purpose-built roles. All configuration is managed by Ansible.

*   **Core Services Hub (`pi5-control`):** A Raspberry Pi 5 that runs the primary, persistent services for development, identity, and access.
    *   **Services:** Gitea, MinIO, Docker Registry, Nginx Proxy Manager, Nginx Web Server, Authentik.

*   **Intelligence & Analysis Node (`pi4-intel`):** An 8GB Raspberry Pi 4B dedicated to the most memory-intensive application.
    *   **Services:** OpenCTI (and its full stack: Elasticsearch, RabbitMQ, Redis).

*   **Management & DNS Node (`pi4-mgmt`):** A Raspberry Pi 4B for high-level management and network-wide DNS services.
    *   **Services:** Portainer, Pi-hole.

*   **Build Node (`localhost`):** The Ansible control node (your MacBook Pro) which also runs the specialized Drone Runner for executing Packer builds.

---
## Configuration: The `group_vars` System

This project uses Ansible's `group_vars` system to manage all configuration automatically and elegantly. All operational variables are defined here.

1.  **`inventory/hosts.ini`:** The source of truth for your cluster's layout. You **must** edit this file to set the real static IPs of your Raspberry Pis.

2.  **`group_vars/all.yml` (Encrypted Secrets):** Contains all sensitive passwords and API keys. It is encrypted with Ansible Vault.
    *   **To create it:** `ansible-vault create group_vars/all.yml`
    *   **To edit it:** `ansible-vault edit group_vars/all.yml`

3.  **`group_vars/pi_cluster.yml` (Non-Sensitive Variables):** Contains all non-sensitive, cluster-wide variables like service usernames, file paths, URLs, and the list of services to be exposed via the reverse proxy (`proxy_hosts`). This is the primary file for high-level configuration.

---
## One-Time Manual Bootstrap Process

Before Ansible can manage a new Raspberry Pi, it must be manually bootstrapped once.

1.  **Flash OS:** Flash the latest 64-bit Raspberry Pi OS Lite.
2.  **Enable SSH:** Create an empty file named `ssh` in the `boot` partition.
3.  **First Boot & IP:** Boot the Pi and assign it a static IP address on your router.
4.  **Create Admin User & Key:** Create a `pi_admin` user with sudo rights and copy your SSH key for passwordless login using `ssh-copy-id`.
5.  **Disable `pi` user:** Lock the default `pi` user account (`sudo passwd -l pi`).

---
## Automated Deployment & Configuration Workflow

The entire deployment is handled by a two-step Ansible process.

### Step 1: Deploy Core Infrastructure (`site.yml`)
This playbook deploys all service containers to the Raspberry Pi cluster.
```bash
# From the root of this project, run:
ansible-playbook -i inventory/hosts.ini site.yml --ask-vault-pass
```
### Step 2: Configure Services (post-configure.yml)
After the containers are running, this playbook configures them via their APIs. It creates the Reverse Proxy entries and Local DNS records automatically.

```bash
# From the root of this project, run:
ansible-playbook -i inventory/hosts.ini post-configure.yml --ask-vault-pass
```
#### Deploying the Local Drone Runner (MacBook Pro)
The Drone Runner must be deployed to the macOS build node where VMware Fusion is installed.

```bash
# Prerequisite: Docker Desktop must be running on your Mac.
ansible-playbook -i inventory/local.ini deploy-runner.yml --ask-vault-pass
```
### Deployed Services Quick Reference
Access to all services is managed via the Nginx Proxy Manager and Pi-hole DNS, which are configured automatically. After running the playbooks, use the following hostnames in your browser.

- Gitea (Git): http://gitea.local

- MinIO (Artifacts): http://minio.local

- Authentik (IAM/SSO): http://auth.local

- OpenCTI (Threat Intel): http://opencti.local

- Portainer (Management): http://portainer.local (Note: Manual config may be needed for HTTPS if desired)

- Pi-hole (DNS/Ad-block): http://pihole.local/admin

- Static Website: http://www.local

- Nginx Proxy Manager (Admin): http://<IP_of_Pi5>:81
