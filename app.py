from flask import Flask , request , jsonify , render_template
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
app.config.setdefault('SQLALCHEMY_TRACK_MODIFICATIONS' , True)

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Record(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    thing = db.Column(db.String(120) , nullable = True)
    memo = db.Column(db.String , nullable = True)
    check = db.Column(db.String , nullable = True)

# 以上都是在架設 database

@app.route("/")
def index():
    return render_template("dolist.html")

@app.route("/name")
def name():
    return "Hello Frank"

# 新增帳務紀錄    
@app.route("/record" , methods = ['POST'])
def add_record():
    req_data = request.form
    thing = req_data['thing']
    memo = req_data['memo']
    record = Record(thing = thing , memo=memo)
    db.session.add(record)
    db.session.commit()
    return 'Create Succeeded', 200



@app.route("/record",methods = ["GET"])
def get_records():
    records = Record.query.all()
    #從資料庫中找出所有record的資料
    records_data = [
        {
            'id' : record.id,
            'thing' : record.thing,
            'memo' : record.memo,
            'check' : record.check,
        }
        for record in records
    ]

    return jsonify(records_data), 200

@app.route('/record/<int:record_id>',methods = ['GET'])
def get_record(record_id):
    record = (Record.query.filter_by(id=record_id).first)
    record_data = {
        'id' : record.id,
        'name' : record.name,
        'cost' : record.cost 
    }
    return jsonify (record_data),200
#查詢帳務紀錄
@app.route("/record/<int:record_id>" , methods = ["PUT"])
def update_record(record_id):
    req_data = request.form
    record = (
        Record.query.filter_by(id=record_id).first()
    )
    if 'check' in req_data:
        record.check = req_data['check']
    else:
        record.thing = req_data['thing']
        record.memo = req_data['memo']
    
    db.session.add(record)
    db.session.commit()
  
    return "Update Succeed" , 200

#刪除帳務紀錄
@app.route("/record/<int:record_id>" , methods = ["DELETE"])
def delete_record(record_id):
    record = Record.query.filter_by(id=record_id).first()
    db.session.delete(record)
    db.session.commit()
    return"Delete Succeeded",200