version: '3.8'

services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    container_name: nginx_proxy_manager
    restart: unless-stopped
    ports:
      # These ports are publicly exposed to the network.
      - '80:80'   # Public HTTP Port
      - '443:443' # Public HTTPS Port
      - '81:81'   # Admin Web UI
    volumes:
      - '{{ app_data_base_path }}/reverse-proxy/data:/data'
      - '{{ app_data_base_path }}/reverse-proxy/letsencrypt:/etc/letsencrypt'
