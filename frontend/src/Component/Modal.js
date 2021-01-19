import React from "react";
import "../App.css";
import PropTypes from "prop-types";

export default class Modal extends React.Component {
  onClose = e => {
    this.props.onClose && this.props.onClose(e);
  };

  render() {
    console.log("Modal Show is " + this.props.show);
    if (!this.props.show) {
      return null;
    }
    return (
      <div id="myModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={this.onClose}>
            &times;
          </span>
          <div id="modalcontent">{this.props.children}</div>
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
};
