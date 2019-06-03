//Select the submit button
var submit = d3.select("#submit");

function buildForecast(nb_periods) {
    d3.json(`/forecast/${nb_periods}`).then((data) => {

        var month = data.map(data => data.month);
        var nb_cases = data.map(data => data.nb_cases);
        console.log(nb_cases);
        var nb_units = data.map(data => data.nb_units);
        var forecast_cases = data.map(data => data.forecast_cases);
        console.log(forecast_cases);
        var forecast_units = data.map(data => data.forecast_units);
        console.log(forecast_units);
        var min_date = Math.min(month);
        var max_date = Math.max(month);

        // Build time series with range slider
        var trace1 = {
            type: "scatter",
            mode: "lines",
            name: 'Nb Cases',
            x: month,
            y: nb_cases,
            line: {color: '#ff6600'}
        }
    
        var trace2 = {
            type: "scatter",
            mode: "lines",
            name: 'Nb Units',
            x: month,
            y: nb_units,
            line: {color: '#0099cc'}
        }

        var trace3 = {
            type: "scatter",
            mode: "lines",
            name: 'Forecast (cases)',
            x: month,
            y: forecast_cases,
            line: {color: '#cc0066'}
        }

        var trace4 = {
            type: "scatter",
            mode: "lines",
            name: 'Forecast (units)',
            x: month,
            y: forecast_units,
            line: {color: '#40ff00'}
        }

        var data = [trace1, trace2, trace3, trace4];

        var layout = {
            autosize: false,
            width: 1000,
            height: 800,
            title: 'Volume of Cases and Units',
            xaxis: {
                autorange: true,
                range: [min_date, max_date],
                rangeselector: {buttons: [
                    {
                        count: 24,
                        label: '24m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {step: 'all'}    
                ]},
                rangeslider: {range: [min_date, max_date]},
                type: 'date'
            },
            yaxis: {
                //autorange: true,
                fixedrange: false,
                type: 'linear'
            }
        };

        Plotly.newPlot('forecast', data, layout, {displaylogo: false});

    });
}

function newPeriod() {

    //Prevent the page from refreshing
    d3.event.preventDefault();

    // Select the input element
    var forecastingPeriod = d3.select("#user-input").property("value");
    buildForecast(forecastingPeriod);
}

// Initialize the dashboard
buildForecast('0');
submit.on("click", newPeriod)