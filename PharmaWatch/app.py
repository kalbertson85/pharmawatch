from twilio.rest import Client
from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
from apscheduler.schedulers.background import BackgroundScheduler
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pharma_watch.db'
app.config['SECRET_KEY'] = 'your_secret_key'

# Email config
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'your_email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your_email_password'
mail = Mail(app)

# Twilio config
twilio_sid = 'your_twilio_sid'
twilio_auth_token = 'your_twilio_auth_token'
twilio_phone_number = 'your_twilio_phone_number'
client = Client(twilio_sid, twilio_auth_token)

db = SQLAlchemy(app)

class Medicine(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    expiry_date = db.Column(db.Date, nullable=False)

@app.route('/')
def index():
    medicines = Medicine.query.all()
    return render_template('index.html', medicines=medicines)

@app.route('/add_medicine', methods=['POST'])
def add_medicine():
    name = request.form['name']
    quantity = request.form['quantity']
    expiry_date = datetime.datetime.strptime(request.form['expiry_date'], '%Y-%m-%d').date()
    new_medicine = Medicine(name=name, quantity=quantity, expiry_date=expiry_date)
    db.session.add(new_medicine)
    db.session.commit()
    return redirect(url_for('index'))

@app.route('/send_alerts')
def send_alerts():
    run_expiry_check()
    return "Manual alerts sent."

# Function to get medicines expiring soon
def get_expiring_medicines(days_before=7):
    today = datetime.date.today()
    upcoming = today + datetime.timedelta(days=days_before)
    return Medicine.query.filter(Medicine.expiry_date <= upcoming).all()

# Email alert function
def send_email_alert(medicine):
    msg = Message(
        f'⚠️ Expiry Alert: {medicine.name}',
        sender='your_email@gmail.com',
        recipients=['recipient_email@example.com'],
        body=(
            f"Dear User,\n\n"
            f"The medicine '{medicine.name}' (Qty: {medicine.quantity}) will expire on {medicine.expiry_date}.\n"
            f"Please take action.\n\n"
            f"PharmaWatch"
        )
    )
    try:
        mail.send(msg)
        print(f"[EMAIL SENT] {medicine.name}")
    except Exception as e:
        print(f"[EMAIL ERROR] {medicine.name}: {e}")

# SMS alert function
def send_sms_alert(medicine):
    try:
        phone_number = '+13365698735'
        message = client.messages.create(
            body=f"[PharmaWatch] '{medicine.name}' expires on {medicine.expiry_date}.",
            from_=twilio_phone_number,
            to=phone_number
        )
        print(f"[SMS SENT] {medicine.name}")
    except Exception as e:
        print(f"[SMS ERROR] {medicine.name}: {e}")

# Check and alert function (used in both manual and scheduled)
def run_expiry_check():
    with app.app_context():
        expiring_medicines = get_expiring_medicines()
        for med in expiring_medicines:
            send_email_alert(med)
            send_sms_alert(med)

# Scheduler setup
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(run_expiry_check, 'interval', hours=24)
    scheduler.start()
    print("[SCHEDULER STARTED] Will check for expiries every 24 hours.")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    start_scheduler()
    app.run(debug=True)