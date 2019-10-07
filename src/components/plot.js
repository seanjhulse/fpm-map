import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { update } from '../store/actions';

const Chart = require('chart.js');

class Plot extends Component {
  constructor(props) {
    super(props);

    this.state = {
      plot: undefined,
      chartname: '',
      chart: undefined,
      value: 0,
    };

    this.isVisible = this.isVisible.bind(this);
  }

  getRoundedDate(minutes, d = new Date()) {
    const ms = 1000 * 60 * minutes; // convert minutes to ms
    const roundedDate = new Date(Math.round(d.getTime() / ms) * ms);
    const hours = roundedDate.getHours();
    const min = (roundedDate.getMinutes() < 10 ? '0' : '') + roundedDate.getMinutes();
    const today = new Date();
    today.setHours(hours);
    today.setMinutes(min);
    return today;
  }

  isVisible() {
    return this.state.chart !== undefined;
  }

  componentDidUpdate() {
    const { plots } = this.props;
    const labels = [];
    const datasets = [];
    let values = [];
    let value = 0;

    Object.keys(plots).map((plotName) => {
      const plot = plots[plotName];
      plot.data.map((data) => {
        const date = this.getRoundedDate(1, new Date(data.time));
        labels.push(date);
      });

      values = plot.data.map((data) => {
        value += data.currentvalue;
        return data.currentvalue;
      });

      datasets.push({
        label: `${plot.name} ${plot.data[0].units}`,
        fillColor: 'rgba(220,220,220,0.2)',
        strokeColor: 'rgba(220,220,220,1)',
        pointColor: 'rgba(220,220,220,1)',
        pointStrokeColor: '#fff',
        pointHighlightFill: '#fff',
        pointHighlightStroke: 'rgba(220,220,220,1)',
        data: values,
      });
    });

    if (this.state.chart) {
      // clean up the old chart
      this.state.chart.destroy();
      document.getElementById('chart').remove();
      const el = document.createElement('canvas');
      el.id = 'chart';
      el.width = 376;
      el.height = 376;
      document.querySelector('.plot-inner').appendChild(el);
    }

    const ctx = document.getElementById('chart').getContext('2d');
    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets,
      },
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            distribution: 'linear',
          }],
        },
      },
    });

    // prevents infinite componentDidUpdate cycles
    if (value !== this.state.value) {
      this.setState({ chart, value });
    }
  }

  render() {
    return (
      <div className="plot-container">
        <div className="plot-inner" style={{
          visibility: this.isVisible() ? 'visible' : 'hidden',
          zIndex: this.isVisible() ? '9999' : '-1',
        }}>
          <canvas id="chart" width="376" height="376"></canvas>
        </div>
      </div>
    );
  }
}

Plot.propTypes = {
  plots: PropTypes.object,
};

const mapStateToProps = (state) => ({
  plots: state.plots,
});

const mapDispatchToProps = (dispatch) => ({
  update: (key, value) => dispatch(update(key, value)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Plot);
