from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_mail import Mail, Message
import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pharma_watch.db'
app.config['SECRET_KEY'] = 'your_secret_key'

# Set up email notifications (example using Gmail)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'your_email@gmail.com'
app.config['MAIL_PASSWORD'] = 'your_email_password'
mail = Mail(app)

db = SQLAlchemy(app)

# Define the Stock and Expiry Model
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
    if request.method == 'POST':
        name = request.form['name']
        quantity = request.form['quantity']
        expiry_date = datetime.datetime.strptime(request.form['expiry_date'], '%Y-%m-%d').date()

        new_medicine = Medicine(name=name, quantity=quantity, expiry_date=expiry_date)
        db.session.add(new_medicine)
        db.session.commit()
        return redirect(url_for('index'))

@app.route('/send_alerts')
def send_alerts():
    today = datetime.date.today()
    medicines = Medicine.query.all()

    for medicine in medicines:
        if medicine.expiry_date <= today:
            send_email_alert(medicine)

    return "Alerts sent successfully!"

def send_email_alert(medicine):
    msg = Message(
        'Expiry Alert: Medicine Expiring Soon',
        sender='your_email@gmail.com',
        recipients=['recipient_email@example.com'],
        body=f"Dear User,\n\nThe medicine {medicine.name} is about to expire. Please take necessary action.\n\nExpiry Date: {medicine.expiry_date}\n\nRegards,\nPharmaWatch Team"
    )
    try:
        mail.send(msg)
        print(f"Alert sent for {medicine.name}")
    except Exception as e:
        print(f"Error sending alert for {medicine.name}: {str(e)}")

if __name__ == '__main__':
    with app.app_context(): # Creates the database file (pharma_watch.db) with the Medicine table
        db.create_all()
    app.run(debug=True)    