var xField = 'Date';
var yField = 'Price';


// This is for the things at the top
var selectorOptions = {
    buttons: [{
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m'
    }, {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m'
    }, {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'YTD'
    }, {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y'
    }, {
        step: 'all',
    }],
};


Plotly.d3.csv("dollar.csv", function(err, rawData) {
    if(err) throw err;
    Plotly.d3.csv("dollar.csv", function(err2, rawData2) {
        if(err2) throw err2;

        var data = prepData(rawData, rawData2);
        var layout = {
            title: 'Time series with range slider and selectors',
            xaxis: {
                rangeselector: selectorOptions,
                rangeslider: {}
            },
            yaxis: {
                fixedrange: true
            }
        };

        Plotly.plot('graph', data, layout);
    });
});

function prepData(rawData, rawData2) {
    var x = [];
    var y = [];
    var x2 = [];
    var y2 = [];

    console.log(rawData.length)

    rawData.forEach(function(datum, i) {
        // if(i % 100) return;
        // console.log(i%100)
        x.push(new Date(datum[xField]));
        y.push(datum[yField]);
    });

    rawData2.forEach(function(datum, i) {
        // if(i % 100) return;
        // console.log(i%100)
        x2.push(new Date(datum[xField]));
        y2.push(datum[yField]);
    });

    console.log(x2)
    console.log(y2)

    var trace1 = {
        mode: 'lines',
        x: x,
        y: y
    };

    var trace2 = {
        mode: 'lines',
        x: x2,
        y: y2
     };

    return [trace1, trace2]
}