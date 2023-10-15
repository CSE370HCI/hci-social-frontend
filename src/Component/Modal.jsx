import React from 'react';
import "../App.css";
import PropTypes from 'prop-types';

// This component is an example of a modal dialog.  The content can be swapped out for different uses, and
// should be passed in from the parent class.
const Modal = ({ onClose, show, children }) => {

  // Function to handle close event
  const handleClose = (e) => {
    onClose && onClose(e);
  };

  console.log("Modal Show is " + show);

  if (!show) {
    return null;
  }

  return (
    <div id="myModal" className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>
          &times;
        </span>
        <div id="modalcontent">{children}</div>
      </div>
    </div>
  );
};

// Prop types validation
Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired
};

export default Modal;