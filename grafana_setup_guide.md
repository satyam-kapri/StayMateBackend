# Complete Grafana Monitoring Stack Setup Guide

> [!IMPORTANT]
> Run **all commands** on your EC2 instance via SSH. Replace `harito-api` with your actual systemd service name wherever you see it. Replace `8080` with your actual Node.js port.

## Prerequisites

Before you begin, SSH into your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

Check your Node.js service name (you'll need this later):
```bash
# This lists all running services. Find the one running your Node app.
sudo systemctl list-units --type=service --state=running | grep -i harito
```
Note down the service name (e.g., `harito-api.service`).

Check what port your Node.js app runs on:
```bash
# Look at your .env or service file for the PORT value
cat /path/to/your/haritoAPI/.env | grep PORT
```

---

## Step 1: Create a Dedicated Directory

We'll keep all monitoring tools organized in one place.

```bash
# Create a directory to store all monitoring binaries and configs
sudo mkdir -p /opt/monitoring
cd /opt/monitoring
```

**What this does:** Creates a clean folder at `/opt/monitoring` where we'll download and configure everything.

---

## Step 2: Install Grafana Loki (The Log Database)

Loki is like a database that stores your application logs. Promtail (Step 3) will send logs here, and Grafana (Step 5) will query logs from here.

### 2.1 Download Loki

```bash
cd /opt/monitoring

# Download the Loki binary (this is the actual program)
sudo wget https://github.com/grafana/loki/releases/download/v2.9.2/loki-linux-amd64.zip

# Unzip it (install unzip if you don't have it)
sudo apt-get install -y unzip
sudo unzip loki-linux-amd64.zip

# Make it executable (allow the system to run it)
sudo chmod a+x loki-linux-amd64

# Clean up the zip file
sudo rm loki-linux-amd64.zip
```

### 2.2 Create Loki Configuration File

```bash
sudo nano /opt/monitoring/loki-config.yaml
```

This opens a text editor. Paste the following content **exactly as-is**:

```yaml
auth_enabled: false

server:
  http_listen_port: 3100

common:
  path_prefix: /opt/monitoring/loki-data
  storage:
    filesystem:
      chunks_directory: /opt/monitoring/loki-data/chunks
      rules_directory: /opt/monitoring/loki-data/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: tsdb
      object_store: filesystem
      schema: v13
      index:
        prefix: index_
        period: 24h

limits_config:
  allow_structured_metadata: true
  volume_enabled: true
```

**Save and exit:** Press `Ctrl + X`, then `Y`, then `Enter`.

### 2.3 Create the Data Directory

```bash
sudo mkdir -p /opt/monitoring/loki-data/chunks
sudo mkdir -p /opt/monitoring/loki-data/rules
```

### 2.4 Create a Systemd Service for Loki

This tells Ubuntu to run Loki automatically in the background (and restart it if it crashes).

```bash
sudo nano /etc/systemd/system/loki.service
```

Paste this content:

```ini
[Unit]
Description=Grafana Loki Log Aggregation System
After=network.target

[Service]
Type=simple
ExecStart=/opt/monitoring/loki-linux-amd64 -config.file=/opt/monitoring/loki-config.yaml
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

**Save and exit:** Press `Ctrl + X`, then `Y`, then `Enter`.

### 2.5 Start Loki

```bash
# Tell systemd to recognize the new service file
sudo systemctl daemon-reload

# Start Loki
sudo systemctl start loki

# Enable it to start automatically on boot
sudo systemctl enable loki

# Verify it's running (should say "active (running)")
sudo systemctl status loki
```

### 2.6 Test Loki

```bash
# This should return: {"status":"ready"}
curl http://localhost:3100/ready
```

If you see `{"status":"ready"}`, Loki is working. Move to Step 3.

---

## Step 3: Install Promtail (The Log Shipper)

Promtail reads the logs your Node.js app writes and sends them to Loki. Since your app runs as a systemd service, Promtail will read from the **systemd journal**.

### 3.1 Download Promtail

```bash
cd /opt/monitoring

sudo wget https://github.com/grafana/loki/releases/download/v2.9.2/promtail-linux-amd64.zip
sudo unzip promtail-linux-amd64.zip
sudo chmod a+x promtail-linux-amd64
sudo rm promtail-linux-amd64.zip
```

### 3.2 Create Promtail Configuration File

```bash
sudo nano /opt/monitoring/promtail-config.yaml
```

Paste this content. **Replace `harito-api.service`** on the `regex` line with your actual service name from the Prerequisites step:

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /opt/monitoring/promtail-positions.yaml

clients:
  - url: http://localhost:3100/loki/api/v1/push

scrape_configs:
  - job_name: journal
    journal:
      json: false
      max_age: 12h
      path: /var/log/journal
      labels:
        job: harito-api
    relabel_configs:
      - source_labels: ['__journal__systemd_unit']
        target_label: 'unit'
      # IMPORTANT: Change the regex below to match YOUR service name
      - source_labels: ['__journal__systemd_unit']
        regex: 'harito-api.service'
        action: keep
    pipeline_stages:
      - json:
          expressions:
            level: level
            msg: msg
      - labels:
          level:
```

**Save and exit:** Press `Ctrl + X`, then `Y`, then `Enter`.

**What this does:**
- `clients.url`: Tells Promtail to send logs to Loki running on `localhost:3100`.
- `journal.path`: Reads logs from the systemd journal (where your Node.js service output goes).
- `regex: 'harito-api.service'`: **Only** captures logs from your Node.js service, ignoring everything else.
- `pipeline_stages`: Parses the JSON logs so you can filter by log `level` (info, warn, error) in Grafana.

### 3.3 Create a Systemd Service for Promtail

```bash
sudo nano /etc/systemd/system/promtail.service
```

Paste this content:

```ini
[Unit]
Description=Promtail Log Shipper
After=network.target loki.service

[Service]
Type=simple
ExecStart=/opt/monitoring/promtail-linux-amd64 -config.file=/opt/monitoring/promtail-config.yaml
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
# Promtail needs root access to read the systemd journal
User=root

[Install]
WantedBy=multi-user.target
```

**Save and exit:** Press `Ctrl + X`, then `Y`, then `Enter`.

### 3.4 Start Promtail

```bash
sudo systemctl daemon-reload
sudo systemctl start promtail
sudo systemctl enable promtail
sudo systemctl status promtail
```

You should see `active (running)`.

---

## Step 4: Install Prometheus (The Metrics Database)

Prometheus will periodically call your Node.js app's `/metrics` endpoint and store the data (response times, error counts, memory usage, etc.).

### 4.1 Install Prometheus

```bash
sudo apt-get update
sudo apt-get install -y prometheus
```

### 4.2 Configure Prometheus to Scrape Your Node App

```bash
sudo nano /etc/prometheus/prometheus.yml
```

Find the `scrape_configs:` section at the bottom of the file. **Add** the following block under it (keep the existing `prometheus` job, just add yours below it). **Replace `8080`** with your actual Node.js port:

```yaml
  - job_name: 'harito-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8080']
```

The final file should look something like this:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'harito-api'
    scrape_interval: 15s
    static_configs:
      - targets: ['localhost:8080']
```

**Save and exit:** Press `Ctrl + X`, then `Y`, then `Enter`.

### 4.3 Restart Prometheus

```bash
sudo systemctl restart prometheus
sudo systemctl enable prometheus
sudo systemctl status prometheus
```

### 4.4 Test Prometheus

```bash
# First, check that YOUR app's metrics endpoint works
curl http://localhost:8080/metrics

# You should see a big block of text starting with lines like:
# # HELP http_request_duration_seconds ...
# # TYPE http_request_duration_seconds histogram ...
```

If you see metrics output, Prometheus will be able to scrape it.

---

## Step 5: Install Grafana (The Dashboard)

Grafana is the web UI where you'll see all your logs and metrics in beautiful charts.

### 5.1 Install Grafana

Run these commands one by one:

```bash
# Install required packages
sudo apt-get install -y apt-transport-https software-properties-common wget

# Add the Grafana signing key (this verifies the download is authentic)
sudo mkdir -p /etc/apt/keyrings/
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg > /dev/null

# Add the Grafana repository to your system
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list

# Update package list and install Grafana
sudo apt-get update
sudo apt-get install -y grafana
```

### 5.2 Start Grafana

```bash
sudo systemctl enable grafana-server
sudo systemctl start grafana-server
sudo systemctl status grafana-server
```

### 5.3 Open Port 3000 in AWS Security Group

Grafana runs on port `3000`. You need to allow access to it from your browser.

1. Go to **AWS Console** → **EC2** → **Security Groups**.
2. Find the Security Group attached to your EC2 instance.
3. Click **Edit Inbound Rules** → **Add Rule**.
4. Set: **Type** = `Custom TCP`, **Port** = `3000`, **Source** = `My IP` (for security).
5. Click **Save Rules**.

### 5.4 Log Into Grafana

1. Open your browser and go to: `http://<your-ec2-public-ip>:3000`
2. **Username:** `admin`
3. **Password:** `admin`
4. It will ask you to set a new password. Set a strong one immediately.

---

## Step 6: Connect Data Sources in Grafana

Now you'll tell Grafana where to find Prometheus (metrics) and Loki (logs).

### 6.1 Add Prometheus Data Source

1. In Grafana, click the **hamburger menu (☰)** on the top-left.
2. Go to **Connections** → **Data Sources**.
3. Click **Add data source**.
4. Search for and select **Prometheus**.
5. In the **URL** field, enter: `http://localhost:9090`
6. Scroll to the bottom and click **Save & Test**.
7. You should see a green ✅ message saying "Successfully queried the Prometheus API."

### 6.2 Add Loki Data Source

1. Click **Add data source** again.
2. Search for and select **Loki**.
3. In the **URL** field, enter: `http://localhost:3100`
4. Scroll to the bottom and click **Save & Test**.
5. You should see a green ✅ message.

---

## Step 7: Create Your First Dashboard

### 7.1 Import a Pre-built Metrics Dashboard

1. Click the **hamburger menu (☰)** → **Dashboards**.
2. Click **New** → **Import**.
3. In the **"Import via grafana.com"** field, type: `11159` and click **Load**.
4. On the next screen, select your **Prometheus** data source from the dropdown.
5. Click **Import**.

You now have a full dashboard showing your API's **request rates, response times, error rates, and memory/CPU usage**!

### 7.2 View Your Logs

1. Click the **hamburger menu (☰)** → **Explore**.
2. At the top, select **Loki** as the data source.
3. Click **Label browser**, select `job` = `harito-api`.
4. Click **Run query**.
5. You should see your Node.js application's JSON logs streaming in real-time.

---

## Quick Reference: Ports Used

| Service    | Port   | Purpose                          |
|------------|--------|----------------------------------|
| Node.js    | `8080` | Your API + `/metrics` endpoint   |
| Loki       | `3100` | Log storage (internal only)      |
| Promtail   | `9080` | Log shipper status (internal)    |
| Prometheus | `9090` | Metrics storage (internal only)  |
| Grafana    | `3000` | Dashboard UI (browser access)    |

> [!CAUTION]
> Only port `3000` (Grafana) needs to be open in your AWS Security Group for browser access. **Do NOT** expose ports `3100`, `9080`, or `9090` to the public internet. They should only be accessible on `localhost`.

## Troubleshooting

If any service fails to start, check its logs:
```bash
sudo journalctl -u loki.service -n 50 --no-pager
sudo journalctl -u promtail.service -n 50 --no-pager
sudo journalctl -u prometheus.service -n 50 --no-pager
sudo journalctl -u grafana-server.service -n 50 --no-pager
```
