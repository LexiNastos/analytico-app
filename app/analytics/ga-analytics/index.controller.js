﻿(function () {
    'use strict';

    angular
        .module('app')
        .controller('GoogleAnalytics.IndexController', Controller)

    function Controller($scope, $rootScope, $window) {
        // For loading Google Analytics
        $window.location.href = '/app/#/analytics/ga-analytics';
        if ($rootScope.flag == '1') {
            $rootScope.flag = '0';
            $window.location.reload();
        }
        gapi.analytics.ready(function() {

        /**
         * Authorize the user immediately if the user has already granted access.
         * If no access has been created, render an authorize button inside the
         * element with the ID "embed-api-auth-container".
         */
        gapi.analytics.auth.authorize({
          container: 'embed-api-auth-container',
          clientid: '254081485976-4mpdlk6p12n0n6rgiuoq962163n1no0e.apps.googleusercontent.com'
        });


        /**
         * Query params representing the date range.
         */
        var dateRange = {
          'start-date': '14daysAgo',
          'end-date': 'yesterday'
        };

        /**
         * Create a new DateRangeSelector instance to be rendered inside of an
         * element with the id "date-range-selector-container", set its date range
         * and then render it to the page.
         */
        var dateRangeSelector = new gapi.analytics.ext.DateRangeSelector({
          container: 'date-range-selector-container',
          template:
                    '<div class="DateRangeSelector">' +
                    '  <div class="DateRangeSelector-item">' +
                    '    <label>Start Date</label> ' +
                    '    <input type="date">' +
                    '    <label>End Date</label> ' +
                    '    <input type="date">' +
                    '  </div>' +
                    '</div>'
        })
        .set(dateRange)
        .execute();

        /**
         * Register a handler to run whenever the user changes the date range from
         * the first datepicker. The handler will update the dataChart
         * instance as well as change the dashboard subtitle to reflect the range.
         */
        dateRangeSelector.on('change', function(data) {
          
          // Update the "from" dates text.
          /*var datefield = document.getElementById('from-dates');
          datefield.innerHTML = data['start-date'] + '&mdash;' + data['end-date'];*/

          dateRange = data;
          var e = document.getElementById("selectedid");
          var gaid = 'ga:' + e.options[e.selectedIndex].value;
          
          renderTopBrowsersChart(gaid);
          renderTopCountriesChart(gaid);
          renderTopProductsChart(gaid);
        });

        /**
         * Create a new ActiveUsers instance to be rendered inside of an
         * element with the id "active-users-container" and poll for changes every
         * five seconds.
         */
        var activeUsers = new gapi.analytics.ext.ActiveUsers({
          container: 'active-users-container',
          pollingInterval: 5
        });


        /**
         * Add CSS animation to visually show the when users come and go.
         */
        activeUsers.once('success', function() {
          var element = this.container.firstChild;
          var timeout;

          this.on('change', function(data) {
            var element = this.container.firstChild;
            var animationClass = data.delta > 0 ? 'is-increasing' : 'is-decreasing';
            element.className += (' ' + animationClass);

            clearTimeout(timeout);
            timeout = setTimeout(function() {
              element.className =
                  element.className.replace(/ is-(increasing|decreasing)/g, '');
            }, 3000);
          });
        });


        /**
         * Create a new ViewSelector2 instance to be rendered inside of an
         * element with the id "view-selector-container".
         * Pass the template for the view selector with an id for the form
         */
        var viewSelector = new gapi.analytics.ext.ViewSelector2({
          container: 'view-selector-container',
          template:
                    '<div class="ViewSelector2">' +
                    '  <div class="ViewSelector2-item">' +
                    '    <label>Account</label>' +
                    '    <select class="FormField"></select>' +
                    '    <label>Property</label>' +
                    '    <select class="FormField"></select>' +
                    '    <label>View</label>' +
                    '    <select class="FormField" id="selectedid"></select>' +
                    '  </div>' +
                    '</div>'
        })
        .execute();


        /**
         * Update the activeUsers component, the Chartjs charts, and the dashboard
         * title whenever the user changes the view.
         */
        viewSelector.on('viewChange', function(data) {
          var title = document.getElementById('view-name');
          title.innerHTML = data.property.name + ' (' + data.view.name + ')';

          // Start tracking active users for this view.
          activeUsers.set(data).execute();

          // Render all the of charts for this view.
          renderWeekOverWeekChart(data.ids);
          renderYearOverYearChart(data.ids);
          renderTopBrowsersChart(data.ids);
          renderTopCountriesChart(data.ids);
          renderTopProductsChart(data.ids);
        });


        /**
         * Draw the a chart.js line chart with data from the specified view that
         * overlays session data for the current week over session data for the
         * previous week.
         */
        function renderWeekOverWeekChart(ids) {

          // Adjust `now` to experiment with different days, for testing only...
          var now = moment(); // .subtract(3, 'day');

          var thisWeek = query({
            'ids': ids,
            'dimensions': 'ga:date,ga:nthDay',
            'metrics': 'ga:sessions',
            'start-date': moment(now).subtract(1, 'day').day(0).format('YYYY-MM-DD'),
            'end-date': moment(now).format('YYYY-MM-DD')
          });

          var lastWeek = query({
            'ids': ids,
            'dimensions': 'ga:date,ga:nthDay',
            'metrics': 'ga:sessions',
            'start-date': moment(now).subtract(1, 'day').day(0).subtract(1, 'week')
                .format('YYYY-MM-DD'),
            'end-date': moment(now).subtract(1, 'day').day(6).subtract(1, 'week')
                .format('YYYY-MM-DD')
          });

          Promise.all([thisWeek, lastWeek]).then(function(results) {

            var data1 = results[0].rows.map(function(row) { return +row[2]; });
            var data2 = results[1].rows.map(function(row) { return +row[2]; });
            var labels = results[1].rows.map(function(row) { return +row[0]; });

            labels = labels.map(function(label) {
              return moment(label, 'YYYYMMDD').format('ddd');
            });

            var data = {
              labels : labels,
              datasets : [
                {
                  label: 'Last Week',
                  fillColor : 'rgba(220,220,220,0.5)',
                  strokeColor : 'rgba(220,220,220,1)',
                  pointColor : 'rgba(220,220,220,1)',
                  pointStrokeColor : '#fff',
                  data : data2
                },
                {
                  label: 'This Week',
                  fillColor : 'rgba(151,187,205,0.5)',
                  strokeColor : 'rgba(151,187,205,1)',
                  pointColor : 'rgba(151,187,205,1)',
                  pointStrokeColor : '#fff',
                  data : data1
                }
              ]
            };

            new Chart(makeCanvas('chart-1-container')).Line(data);
            generateLegend('legend-1-container', data.datasets);
          });
        }


        /**
         * Draw the a chart.js bar chart with data from the specified view that
         * overlays session data for the current year over session data for the
         * previous year, grouped by month.
         */
        function renderYearOverYearChart(ids) {

          // Adjust `now` to experiment with different days, for testing only...
          var now = moment(); // .subtract(3, 'day');

          var thisYear = query({
            'ids': ids,
            'dimensions': 'ga:month,ga:nthMonth',
            'metrics': 'ga:users',
            'start-date': moment(now).date(1).month(0).format('YYYY-MM-DD'),
            'end-date': moment(now).format('YYYY-MM-DD')
          });

          var lastYear = query({
            'ids': ids,
            'dimensions': 'ga:month,ga:nthMonth',
            'metrics': 'ga:users',
            'start-date': moment(now).subtract(1, 'year').date(1).month(0)
                .format('YYYY-MM-DD'),
            'end-date': moment(now).date(1).month(0).subtract(1, 'day')
                .format('YYYY-MM-DD')
          });

          Promise.all([thisYear, lastYear]).then(function(results) {
            var data1 = results[0].rows.map(function(row) { return +row[2]; });
            var data2 = results[1].rows.map(function(row) { return +row[2]; });
            var labels = ['Jan','Feb','Mar','Apr','May','Jun',
                          'Jul','Aug','Sep','Oct','Nov','Dec'];

            // Ensure the data arrays are at least as long as the labels array.
            // Chart.js bar charts don't (yet) accept sparse datasets.
            for (var i = 0, len = labels.length; i < len; i++) {
              if (data1[i] === undefined) data1[i] = null;
              if (data2[i] === undefined) data2[i] = null;
            }

            var data = {
              labels : labels,
              datasets : [
                {
                  label: 'Last Year',
                  fillColor : 'rgba(220,220,220,0.5)',
                  strokeColor : 'rgba(220,220,220,1)',
                  data : data2
                },
                {
                  label: 'This Year',
                  fillColor : 'rgba(151,187,205,0.5)',
                  strokeColor : 'rgba(151,187,205,1)',
                  data : data1
                }
              ]
            };

            new Chart(makeCanvas('chart-2-container')).Bar(data);
            generateLegend('legend-2-container', data.datasets);
          })
          .catch(function(err) {
            console.error(err.stack);
          });
        }


        /**
         * Draw the a chart.js doughnut chart with data from the specified view that
         * show the top 5 browsers over the past seven days.
         */
        function renderTopBrowsersChart(ids) {

          query({
            'ids': ids,
            'dimensions': 'ga:browser',
            'metrics': 'ga:pageviews',
            'sort': '-ga:pageviews',
            'start-date': dateRange['start-date'],
            'end-date': dateRange['end-date'],
            'max-results': 5
          })
          .then(function(response) {

            var data = [];
            var colors = ['#4D5360','#949FB1','#D4CCC5','#E2EAE9','#F7464A'];

            response.rows.forEach(function(row, i) {
              data.push({ value: +row[1], color: colors[i], label: row[0] });
            });

            new Chart(makeCanvas('chart-3-container')).Doughnut(data);
            generateLegend('legend-3-container', data);
          });
        }


        /**
         * Draw the a chart.js doughnut chart with data from the specified view that
         * compares sessions from mobile, desktop, and tablet over the past seven
         * days.
         */
        function renderTopCountriesChart(ids) {
          query({
            'ids': ids,
            'dimensions': 'ga:country',
            'metrics': 'ga:sessions',
            'sort': '-ga:sessions',
            'start-date': dateRange['start-date'],
            'end-date': dateRange['end-date'],
            'max-results': 5
          })
          .then(function(response) {

            var data = [];
            var colors = ['#4D5360','#949FB1','#D4CCC5','#E2EAE9','#F7464A'];

            response.rows.forEach(function(row, i) {
              data.push({
                label: row[0],
                value: +row[1],
                color: colors[i]
              });
            });

            new Chart(makeCanvas('chart-4-container')).Doughnut(data);
            generateLegend('legend-4-container', data);
          });
        }

        /**
         * Queries top performing product data from the GA API 
         * @param {string} ids The Google client identifier
         */
        function renderTopProductsChart(ids) {
          query({
            'ids': ids,
            'dimensions': 'ga:productName' ,
            'metrics': 'ga:itemQuantity,ga:revenuePerItem,ga:itemRevenue',
            'sort' : '-ga:itemRevenue',
            'start-date': dateRange['start-date'],
            'end-date': dateRange['end-date'],
            'max-results': 10
          })
          .then(function(response) {
            var columnNames = ['Product Name','Quantity Sold','Average Price','Product Revenue'];
            var headerHTML = '<h3>Top Performing Products</h3>'
            renderTable(response, 'chart-top-products', headerHTML, columnNames)
          });
        }

        /**
         * Writes a table to index.html containing data returned from the GA API response.
         * @param {Object} response The API response from GA
         * @param {string} id The id attribute of the containing HTML element
         * @param {string} headerHTML The HTML header for this data section
         * @param {string Array} columnNames The column names for this table
         */
        function renderTable(response, id, headerHTML, columnNames) {
            var output = [];
            var table = ['<table>', headerHTML];

            // Create table header row
            table.push('<tr>');
            for (var i = 0; i < columnNames.length; i++) {
                table.push('<th>', columnNames[i], '</th>');
            }
            table.push('</tr>');

            // Create table data rows
            for (var i = 0; i < response.rows.length; i++) {
                table.push('<tr>');
                for (var j = 0; j < response.rows[i].length; j++) {
                    table.push('<td>', response.rows[i][j], '</td>');
                }
                table.push('</tr>')
            } 
            table.push('</table>')
            
            output.push(table.join(''));
            document.getElementById(id).innerHTML = output.join('');
        }   

        /**
         * Extend the Embed APIs `gapi.analytics.report.Data` component to
         * return a promise the is fulfilled with the value returned by the API.
         * @param {Object} params The request parameters.
         * @return {Promise} A promise.
         */
        function query(params) {
          return new Promise(function(resolve, reject) {
            var data = new gapi.analytics.report.Data({query: params});
            data.once('success', function(response) { resolve(response); })
                .once('error', function(response) { reject(response); })
                .execute();
          });
        }


        /**
         * Create a new canvas inside the specified element. Set it to be the width
         * and height of its container.
         * @param {string} id The id attribute of the element to host the canvas.
         * @return {RenderingContext} The 2D canvas context.
         */
        function makeCanvas(id) {
          var container = document.getElementById(id);
          var canvas = document.createElement('canvas');
          var ctx = canvas.getContext('2d');

          container.innerHTML = '';
          canvas.width = container.offsetWidth;
          canvas.height = container.offsetHeight;
          container.appendChild(canvas);

          return ctx;
        }


        /**
         * Create a visual legend inside the specified element based off of a
         * Chart.js dataset.
         * @param {string} id The id attribute of the element to host the legend.
         * @param {Array.<Object>} items A list of labels and colors for the legend.
         */
        function generateLegend(id, items) {
          var legend = document.getElementById(id);
          legend.innerHTML = items.map(function(item) {
            var color = item.color || item.fillColor;
            var label = item.label;
            return '<li><i style="background:' + color + '"></i>' + label + '</li>';
          }).join('');
        }


        // Set some global Chart.js defaults.
        Chart.defaults.global.animationSteps = 60;
        Chart.defaults.global.animationEasing = 'easeInOutQuart';
        Chart.defaults.global.responsive = true;
        Chart.defaults.global.maintainAspectRatio = false;

      });
    }

})();