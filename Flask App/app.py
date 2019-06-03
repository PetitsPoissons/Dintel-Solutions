import os

import numpy as np
import pandas as pd
from datetime import datetime
from dateutil.relativedelta import relativedelta
import statsmodels.api as sm
import simplejson
from json import dumps

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


#################################################
# Database Setup
#################################################

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db/labs_data.sqlite"
db = SQLAlchemy(app)

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(db.engine, reflect=True)

# Save references to each table
Units = Base.classes.units

# Create a session
session = Session(db.engine)

#################################################
# Routes
#################################################

@app.route("/")
def index():
    
    """Return the homepage."""
    return render_template("index.html")

@app.route("/cluster")
def cluster():

    """Return the cluster page."""
    return render_template("cluster.html")

@app.route("/subscriber")
def subscriber():

    """Return the subscriber page."""
    return render_template("subscriber.html")

@app.route("/subscriber/names")
def subscriber_names():

    """Return a list of dental lab names."""
    results = session.query(Units.lab_name).all()
    df = pd.DataFrame(results)
    lab_names = list(df['lab_name'].sort_values().unique())
    
    return jsonify(lab_names)

@app.route("/subscriber/data/<lab_name>")
def subscriber_data(lab_name):

    """Query the database for the lab_name selected by the user and return the jsonified results."""
    sel = [Units.day, Units.nb_cases, Units.nb_units]
    results = session.query(*sel).filter(Units.lab_name == lab_name).all()
    df = pd.DataFrame(results, columns=['date', 'nb_cases', 'nb_units'])
    #return render_template("subscriber.html", jsonify(df.to_dict(orient="records"))
    
    return jsonify(df.to_dict(orient="records"))

@app.route("/forecast/<nb_periods>")
def forecast(nb_periods):
    #Query the database for monthly data volume.
    sel = [func.strftime("%Y-%m", Units.day), func.sum(Units.nb_cases), func.sum(Units.nb_units)]
    results = session.query(*sel).group_by(func.strftime("%Y-%m", Units.day)).all()
    df = pd.DataFrame(results, columns=['month', 'nb_cases', 'nb_units'])
    
    # Prepare dataframe for SARIMAX modeling
    df.month = pd.to_datetime(df.month)
    df.set_index(['month'], inplace=True)
    df.at['2019-05', 'nb_cases'] = 194501 # average of first 4 months in 2019
    df.at['2019-05', 'nb_units'] = 315435 # average of first 4 months in 2019
    df.reset_index(inplace=True)
    df.month = pd.to_datetime(df.month)
    df.set_index(['month'], inplace=True)
    df.index.name=None

    # Model with SARIMAX
    model_cases = sm.tsa.statespace.SARIMAX(df.nb_cases, trend='c', order=(0,1,1), seasonal_order=(0,0,1,12), enforce_stationarity=False, enforce_invertibility=False)
    results_cases = model_cases.fit()
    model_units = sm.tsa.statespace.SARIMAX(df.nb_units, trend='c', order=(1,0,0), seasonal_order=(0,1,1,12), enforce_stationarity=False, enforce_invertibility=False)
    results_units = model_units.fit()

    # Add new time periods to the dataframe
    start = datetime.strptime("2019-06-01", "%Y-%m-%d")
    date_list = [start + relativedelta(months=x) for x in range(0,12)]
    future = pd.DataFrame(index=date_list, columns= df.columns)
    df = pd.concat([df, future])

    # Generate forecasts
    fm = int(nb_periods)
    df['forecast_cases'] = results_cases.predict(start = 94, end = 94+int(fm), dynamic= True)  
    df['forecast_units'] = results_units.predict(start = 94, end = 94+int(fm), dynamic= True)

    # Prepare results to return
    df.index.name = 'month'
    df.reset_index(inplace=True)
    df['month'] = df['month'].apply(lambda x: x.strftime("%Y-%m"))
    response = df.to_dict(orient="records")

    return simplejson.dumps(response, ignore_nan=True)

if __name__ == "__main__":
    app.run(debug=True)
