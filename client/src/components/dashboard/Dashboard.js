import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Container from '../container/Container';
import io from 'socket.io-client';
import SplitPane, { Pane } from 'react-split-pane';
import './style.css';

//Dashbord
const socket = io.connect('http://localhost:8080');
const Dashboard = function ({ auth }) {
  const [student_id_to_name, set_student_id_to_name] = React.useState({});
  const [user_id, set_user_id] = React.useState('');
  var name_to_student_id = new Map();

  const socketCallBack = (data) => {
    // console.log('On user Addedd ', auth.user, data);
    if (auth.user && data.name === auth.user.name) {
      set_user_id(data.id);
    } else {
      if (auth.user && auth.user.role == 'Instructor') {
        if (!name_to_student_id.has(data.name)) {
          console.log('Calling Socket', student_id_to_name);
          set_student_id_to_name({
            ...student_id_to_name,
            [data.id]: data.name
          });
          name_to_student_id.set(data.name, data.id);
        }
        //console.log('SC ', student_id_to_name);
        //console.log('TV', name_to_student_id);
      }
    }
  };

  React.useEffect(() => {
    if (auth.user) {
      socket.on(
        'user-added',
        socketCallBack,
        // function (data) {
        //   // console.log('On user Addedd ', auth.user, data);
        //   if (auth.user && data.name === auth.user.name) {
        //     set_user_id(data.id);
        //   } else {
        //     if (auth.user && auth.user.role == 'Instructor') {
        //       if (!name_to_student_id.has(data.name)) {
        //         console.log('Calling Socket', student_id_to_name);
        //         set_student_id_to_name({
        //           ...student_id_to_name,
        //           [data.id]: data.name
        //         });
        //         name_to_student_id.set(data.name, data.id);
        //       }
        //       //console.log('SC ', student_id_to_name);
        //       //console.log('TV', name_to_student_id);
        //     }
        //   }
        // },
        []
      );
      if (auth.user) {
        socket.emit('add-user', auth.user.name);
      }
    }
  }, [auth.user, student_id_to_name]);

  const onItemClick = (key) => {
    socket.emit('connect-student', key);
  };
  const getPaneWidth = () => {
    if (auth.user && auth.user.role == 'Instructor') {
      return '80%';
    }
    return 0;
  };
  return (
    <div>
      <SplitPane split="vertical" defaultSize={getPaneWidth()} primary="second">
        {auth.user && auth.user.role == 'Instructor' && (
          <List>
            <ListItem button key={user_id}>
              <ListItemIcon>
                <MailIcon />
              </ListItemIcon>
              <ListItemText primary="Me" onClick={() => onItemClick(user_id)} />
            </ListItem>
            {Object.keys(student_id_to_name).map(function (key) {
              return (
                <ListItem button key={key}>
                  <ListItemIcon>
                    <MailIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={student_id_to_name[key]}
                    onClick={() => onItemClick(key)}
                  />
                </ListItem>
              );
            })}
          </List>
        )}
        <Container socket={socket} user_id={user_id} />
      </SplitPane>
    </div>
  );
};

Dashboard.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  auth: state.auth,
  sentProps: ownProps
});

export default connect(mapStateToProps, undefined)(Dashboard);
