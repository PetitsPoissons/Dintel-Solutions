function buildClusters() {
    d3.csv("https://petitspoissons.github.io/dintel_solutions/db/CLUSTERS.csv").then((data) => {

        console.log(data);
        var lab_name = data.map(data => data.lab_name);
        var plan_id = data.map(data => data.plan_id);
        var nb_features = data.map(data => data.nb_features);
        var days_subscribed = data.map(data => data.days_subscribed);
        var nb_cases_month = data.map(data => data.nb_cases_month);
        var nb_units_month = data.map(data => data.nb_units_month);
        var nb_other_settings_month = data.map(data => data.nb_other_settings_month);
        var nb_other_products_month = data.map(data => data.nb_other_products_month);
        var nb_clients_month = data.map(data => data.nb_clients_month);
        var nb_shipping_zipcodes_month = data.map(data => data.nb_shipping_zipcodes_month);
        var cluster_5 = data.map(data => data.cluster_5);
        var cluster_6 = data.map(data => data.cluster_6);

        //Build parallel coordinates plot

        var data = [{
            type: 'parcoords',
            pad: [80, 80, 80, 80, 80, 80, 80, 80],
            line: {
                color: cluster_6,
                colorscale: [[1, 'red'], [2, 'orange'], [3, 'green'], [4, 'cyan'], [5, 'blue']]
            },
            dimensions: [{
                constraintrange: [1, 2],
                range: [1, 5],
                label: 'cluster_5',
                values: cluster_5
            }, {
                constraintrange: [1, 500],
                range: [1, 2000],
                label: 'nb_cases_month',
                values: nb_cases_month
            }, {
                //constraintrange: [200, 800],
                range: [1, 3000],
                label: 'nb_units_month',
                values: nb_units_month
            }, {
                //constraintrange: [10, 80],
                range: [0, 1632],
                label: 'nb_other_settings_month',
                values: nb_other_settings_month
            }, {
                //constraintrange: [10, 80],
                range: [0, 1611],
                label: 'nb_other_settings_month',
                values: nb_other_settings_month
            }, {
                //constraintrange: [750, 1250],
                range: [5, 2865],
                label: 'days_subscribed',
                values: days_subscribed
            }, {
                //constraintrange: [10, 20],
                range: [1, 23],
                label: 'nb_features',
                values: nb_features
            }, {
                //constraintrange: [1, 3],
                range: [1, 11],
                label: 'plan_id',
                values: plan_id
            }]
        }];

        var layout = {
            width: 1200,
        };

        Plotly.plot('graphDiv', data, layout, {displaylogo: false});
    });
}

buildClusters();
