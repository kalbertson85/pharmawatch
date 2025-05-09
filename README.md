# PharmaWatch – Expiry & Stock Alert Tool

PharmaWatch is a lightweight, open-source web app designed to help health workers track medicine stock levels and monitor upcoming expiries. The app sends automated email (and optional SMS) alerts to reduce wastage and stockouts in health facilities.

## Features

- Add, view, and manage medicine stock
- Automatic expiry and low stock alerts
- Email and SMS notifications
- Built using Flask, SQLite, and Bootstrap
- Open for integration with DHIS2

## Getting Started

### Requirements
- Python 3.8+
- Flask
- SQLite
- (Optional) Twilio for SMS alerts

### Setup
```bash
pip install -r requirements.txt
python app.py
