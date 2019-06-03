
function buildChart(lab_name) {
    d3.json(`/subscriber/data/${lab_name}`).then((data) => {

        var date = data.map(data => data.date);
        var nb_cases = data.map(data => data.nb_cases);
        var nb_units = data.map(data => data.nb_units);
        var min_date = Math.min(date);
        var max_date = Math.max(date);

        // Build time series with range slider
        var trace1 = {
            type: "scatter",
            mode: "lines",
            name: 'Nb Cases',
            x: date,
            y: nb_cases,
            line: {color: '#ff6600'}
        }
    
        var trace2 = {
            type: "scatter",
            mode: "lines",
            name: 'Nb Units',
            x: date,
            y: nb_units,
            line: {color: '#0099cc'}
        }

        var data = [trace1,trace2];

        var layout = {
            autosize: false,
            width: 1000,
            height: 800,
            title: 'Volume of Cases and Units',
            xaxis: {
                automargin: true,
                autorange: true,
                range: [min_date, max_date],
                rangeselector: {buttons: [
                    {
                        count: 1,
                        label: '1m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 3,
                        label: '3m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 6,
                        label: '6m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 9,
                        label: '9m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 12,
                        label: '12m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {
                        count: 24,
                        label: '24m',
                        step: 'month',
                        stepmode: 'backward'
                    },
                    {step: 'all'},
                    {
                        count: 1,
                        label: 'YTD',
                        step: 'year',
                        stepmode: 'todate'
                    }
                ]},
                rangeslider: {range: [min_date, max_date]},
                type: 'date'
            },
            yaxis: {
                //automargin: true,
                //autorange: true,
                fixedrange: false,
                type: 'linear'
            }
        };

        Plotly.newPlot('plot', data, layout, {displaylogo: false});

    });
}

function init() {
    // Grab a reference to the dropdown select element
    var selector = d3.select("#selLab");
      
    // Use the list of sample names to populate the select options
    d3.json("/subscriber/names").then((labNames) => {
        labNames.forEach((labName) => {
        selector
            .append("option")
            .text(labName)
            .property("value", labName);
        });
      
        // Use the first labName from the list to build the initial plots
        var firstLabName = labNames[0];
        buildChart(firstLabName);
    });
}

function optionChanged(newLabName) {
    // Fetch new data each time a new labName is selected
    buildChart(newLabName);
}
  
// Initialize the dashboard
init();
  