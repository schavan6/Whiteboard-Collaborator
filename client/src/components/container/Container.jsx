import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Board from '../board/Board';

import './style.css';
const Container = ({ auth, sentProps }) => {
  const [color, setColor] = React.useState('#000000');
  const [size, setSize] = React.useState('5');

  return (
    <div className="container">
      <div className="tools-section">
        <div className="color-picker-container">
          Select Brush Color : &nbsp;
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          />
        </div>

        <div className="brushsize-container">
          Select Brush Size : &nbsp;
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            <option> 5 </option>
            <option> 10 </option>
            <option> 15 </option>
            <option> 20 </option>
            <option> 25 </option>
            <option> 30 </option>
          </select>
        </div>
      </div>

      <div className="board-container">
        <Board
          color={color}
          size={size}
          socket={sentProps.socket}
          user_id={sentProps.user_id}
        ></Board>
      </div>
    </div>
  );
};

Container.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  auth: state.auth,
  sentProps: ownProps
});

export default connect(mapStateToProps, undefined)(Container);
