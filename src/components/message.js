import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'react-bootstrap';

/*
messageTypes:
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'light',
  'dark',
*/

function Message(props) {
  return (
    <div className={`message-container ${(props.message && props.messageType ? ' active' : '')}`}>
      <Alert variant={props.messageType}>{props.message}</Alert>
    </div>
  );
}

Message.propTypes = {
  messageType: PropTypes.string,
  message: PropTypes.string,
};

const mapStateToProps = (state) => ({
  message: state.message,
  messageType: state.messageType,
});

export default connect(mapStateToProps)(Message);
