import React, { useEffect } from 'react';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './style.css';

const Board = ({ auth, sentProps }) => {
  var timeout,
    socket = io.connect('http://localhost:8080'),
    user_id,
    isEmitting = false,
    ctx,
    isDrawing = false,
    hasInput = false,
    student_id_to_name = new Map();

  useEffect(() => {
    //console.log(auth);
    //console.log(sentProps.color);
    drawOnCanvas();
    socket.on('canvas-data', function (data) {
      var root = this;
      var interval = setInterval(function () {
        if (isDrawing) return;
        isDrawing = true;
        clearInterval(interval);
        var image = new Image();
        var canvas = document.querySelector('#board');
        var ctx = canvas.getContext('2d');
        image.onload = function () {
          ctx.drawImage(image, 0, 0);

          isDrawing = false;
        };
        image.src = data;
      }, 50);
    });
    socket.on('user-added', function (data) {
      if (data.name === auth.user.name) {
        user_id = data.id;
        console.log('my id: ' + user_id);
      } else {
        if (auth.user.role == 'Instructor') {
          student_id_to_name[data.id] = data.name;
          console.log(student_id_to_name);
        }
      }
    });
    if (auth.user) {
      //console.log('here1');
      //if (user_id === null || user_id === undefined)
      socket.emit('add-user', auth.user.name);
    }

    ctx.strokeStyle = sentProps.color;
    ctx.lineWidth = sentProps.size;
  });

  const drawOnCanvas = () => {
    var canvas = document.querySelector('#board');
    ctx = canvas.getContext('2d');

    var sketch = document.querySelector('#sketch');
    var sketch_style = getComputedStyle(sketch);
    canvas.width = parseInt(sketch_style.getPropertyValue('width'));
    canvas.height = parseInt(sketch_style.getPropertyValue('height'));

    var mouse = { x: 0, y: 0 };
    var last_mouse = { x: 0, y: 0 };

    /* Mouse Capturing Work */
    canvas.addEventListener(
      'mousemove',
      function (e) {
        last_mouse.x = mouse.x;
        last_mouse.y = mouse.y;

        mouse.x = e.pageX - this.offsetLeft;
        mouse.y = e.pageY - this.offsetTop;
      },
      false
    );

    /* Drawing on Paint App */
    ctx.lineWidth = sentProps.size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = sentProps.color;

    canvas.addEventListener(
      'mousedown',
      function (e) {
        canvas.addEventListener('mousemove', onPaint, false);
      },
      false
    );

    canvas.addEventListener(
      'mouseup',
      function () {
        canvas.removeEventListener('mousemove', onPaint, false);
      },
      false
    );

    var root = this;
    var onPaint = function () {
      ctx.beginPath();
      ctx.moveTo(last_mouse.x, last_mouse.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.closePath();
      ctx.stroke();
      //console.log('props ' + root.props.auth.user.role);
      if (timeout !== undefined) clearTimeout(timeout);
      if (auth.user && auth.user.role === 'Instructor') {
        timeout = setTimeout(function () {
          var base64ImageData = canvas.toDataURL('image/png');
          socket.emit('canvas-data', base64ImageData);
        }, 50);
      }
    };

    //Key handler for input box:
    var handleEnter = function (e) {
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        drawText(
          this.value,
          parseInt(this.style.left, 10),
          parseInt(this.style.top, 10)
        );
        document.body.removeChild(this);
        hasInput = false;

        if (timeout !== undefined) clearTimeout(timeout);
        if (auth.user && auth.user.role === 'Instructor') {
          timeout = setTimeout(function () {
            var base64ImageData = canvas.toDataURL('image/png');
            socket.emit('canvas-data', base64ImageData);
          }, 50);
        }
      }
    };

    //Draw the text onto canvas:
    var drawText = function (txt, x, y) {
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.font = '14px sans-serif';
      ctx.fillText(txt, x - 4, y - 4);
    };

    var addInput = function (x, y) {
      var input = document.createElement('textarea');

      //input.type = "text";
      input.style.position = 'fixed';
      input.style.left = x - 4 + 'px';
      input.style.top = y - 4 + 'px';

      input.onkeydown = handleEnter;

      document.body.appendChild(input);

      input.focus();

      hasInput = true;
    };

    canvas.addEventListener(
      'dblclick',
      function (e) {
        if (hasInput) return;
        addInput(e.clientX, e.clientY);
      },
      false
    );
  };
  return (
    <div className="sketch" id="sketch">
      <canvas className="board" id="board"></canvas>
    </div>
  );
};

Board.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  auth: state.auth,
  sentProps: ownProps
});

export default connect(mapStateToProps, undefined)(Board);
