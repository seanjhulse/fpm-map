import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Spinner } from 'react-bootstrap';

function Loading(props) {
  if (props.loading) {
    return (
      <div className="loading-icon">
        <span className="loading-text">Loading</span>
        <Spinner animation="border" role="status">
          <span className="sr-only">Loading</span>
        </Spinner>
      </div>
    );
  }
  return null;
}

Loading.propTypes = {
  loading: PropTypes.bool,
};

const mapStateToProps = (state) => ({
  loading: state.loading,
});

export default connect(mapStateToProps)(Loading);
