# Bastion IaC (Generation 2): Ansible for Project Bastion Infrastructure

This repository contains the complete Ansible project to provision, configure, and maintain the Raspberry Pi cluster that powers **Project Bastion**. It uses a professional "Infrastructure as Code" (IaC) approach to ensure the entire self-hosted factory is reproducible, documented, and defined as code.

This "Generation 2" architecture has been re-engineered to isolate resource-intensive workloads and provide a stable, high-performance platform for all core services.

---
## Final Architecture

This project configures a three-node Raspberry Pi cluster with distinct, purpose-built roles. All nodes are managed by a central Ansible control plane (your MacBook Pro).

*   **Core Services Hub (`pi5-control`):** A Raspberry Pi 5 that runs the primary, persistent services required for the development pipeline and identity management.
    *   **Services:** Gitea, MinIO, Docker Registry, Nginx Proxy Manager, Nginx Web Server, Authentik.

*   **Intelligence & Analysis Node (`pi4-intel`):** An 8GB Raspberry Pi 4B dedicated to running the most memory- and CPU-intensive application.
    *   **Services:** OpenCTI (and its full stack: Elasticsearch, RabbitMQ, Redis).

*   **Management & Automation Node (`pi4-mgmt`):** A Raspberry Pi 4B for high-level management and future automation tasks.
    *   **Services:** Portainer.

---
## Configuration: The `group_vars` System

This project uses Ansible's `group_vars` system to manage all configuration automatically and elegantly.

1.  **`inventory/hosts.ini`:** This is the source of truth for your cluster's layout. Before running, you **must** edit this file and replace the placeholder IP addresses with the real static IPs of your Raspberry Pis.

2.  **`group_vars/all.yml` (Encrypted Secrets):** This file contains all sensitive passwords and API keys for the entire cluster. It is encrypted with Ansible Vault and its variables are automatically available to all hosts.
    *   **To create it:** `ansible-vault create group_vars/all.yml`
    *   **To edit it:** `ansible-vault edit group_vars/all.yml`
    *   You will be prompted for a vault password, which is required to run the playbooks.

3.  **`group_vars/pi_cluster.yml` (Non-Sensitive Variables):** This file contains all non-sensitive, cluster-wide variables like service usernames, file paths, and URLs. Ansible automatically loads these variables for any host belonging to the `pi_cluster` group. You must edit this file to set the correct IP addresses for your service URLs.

---
## One-Time Manual Bootstrap Process

Before Ansible can manage a new Raspberry Pi, it must undergo a minimal, one-time manual setup.

1.  **Flash OS:** Flash the latest 64-bit Raspberry Pi OS Lite to an SD card or SSD.
2.  **Enable SSH:** In the `boot` partition, create an empty file named `ssh`.
3.  **First Boot:** Boot the Pi and assign it a static IP address on your router.
4.  **Initial Login:** `ssh pi@<ip-address>` (default password `raspberry`).
5.  **Create Admin User:**
    ```bash
    sudo adduser pi_admin
    sudo usermod -aG sudo pi_admin
    ```
6.  **SSH Key Exchange:** From your MacBook Pro, copy your SSH key for passwordless login:
    ```bash
    ssh-copy-id pi_admin@<ip-address>
    ```
7.  **Disable `pi` user:** For security, lock the default `pi` user's password:
    ```bash
    sudo passwd -l pi
    ```
The node is now ready for Ansible management.

---
## Execution

The project contains two primary playbooks: one for the remote cluster and one for the local build node.

### 1. Configuring the Raspberry Pi Cluster
The `site.yml` playbook is the master entry point for configuring the entire cluster. To run it:
```bash
# Ensure your inventory is correct and secrets are vaulted.
# Then, from the root of this project, run:
ansible-playbook -i inventory/hosts.ini site.yml --ask-vault-pass
```
This playbook is fully idempotent and can be safely re-run at any time.

### 2. Deploying the Local Drone Runner (MacBook Pro)
The Drone Runner must be deployed to the macOS build node where VMware Fusion is installed.

Prerequisite: Docker Desktop must be installed and running on your MacBook Pro.

To deploy or update the Drone Runner on your local machine, run the dedicated deploy-runner.yml playbook:

```bash
# From the root of this project, run:
ansible-playbook -i inventory/local.ini deploy-runner.yml --ask-vault-pass
```
### Deployed Services Quick Reference
#### Core Services (pi5-control)
##### Gitea (Git):

- Web UI: http://<IP_of_Pi5>:3000

- SSH Port: 2222

##### MinIO (Artifacts):

- API Endpoint: http://<IP_of_Pi5>:9000

- Web Console: http://<IP_of_Pi5>:9001

##### Authentik (IAM/SSO):

- Web UI: http://<IP_of_Pi5>:9001 (Note: Port conflict with MinIO Console needs resolution, typically via Reverse Proxy)

##### Nginx Proxy Manager (Reverse Proxy):

- Admin UI: http://<IP_of_Pi5>:81

##### Private Docker Registry:

- Endpoint: <IP_of_Pi5>:5000

#### Intelligence Services (pi4-intel)
##### OpenCTI (Threat Intelligence):

- Web UI: http://<IP_of_Pi4B_8GB>:8081

#### Management Services (pi4-mgmt)
##### Portainer (Container Management):

- Web UI: https://<IP_of_Pi4B_other>:9443
