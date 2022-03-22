import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Container from '../container/Container';
import io from 'socket.io-client';

import './style.css';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    })
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    })
  })
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end'
}));

///Dashbord

const Dashboard = function ({ auth }) {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const [student_id_to_name, set_student_id_to_name] = React.useState({});
  const [user_id, set_user_id] = React.useState('');
  var socket = io.connect('http://localhost:8080'),
    /*student_id_to_name = new Map(),*/
    name_to_student_id = new Map();

  React.useEffect(() => {
    socket.on(
      'user-added',
      function (data) {
        if (data.name === auth.user.name) {
          set_user_id(data.id);
        } else {
          if (auth.user.role == 'Instructor') {
            if (!name_to_student_id.has(data.name)) {
              console.log('here');
              //student_id_to_name.set(data.id, data.name);

              set_student_id_to_name({
                ...student_id_to_name,
                [data.id]: data.name
              });
              name_to_student_id.set(data.name, data.id);
              console.log(student_id_to_name);
            }
          }
        }
      },
      []
    );
    if (auth.user) {
      //console.log('here1');
      //if (user_id === null || user_id === undefined)
      socket.emit('add-user', auth.user.name);
    }
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const getDrawerHeader = () => {
    if (auth.user && auth.user.role === 'Instructor') {
      return (
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            sx={{ mr: 2, ...(open && { display: 'none' }) }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      );
    } else {
      return <div></div>;
    }
  };

  const onItemClick = (key) => {
    socket.emit('connect-student', key);
  };

  return (
    <div className="container">
      <Box sx={{ display: 'flex' }}>
        <MuiAppBar open={open}>{getDrawerHeader()}</MuiAppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box'
            }
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? (
                <ChevronLeftIcon />
              ) : (
                <ChevronRightIcon />
              )}
            </IconButton>
          </DrawerHeader>
          <Divider />

          <List>
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
          <Divider />
          <ul>
            {Object.keys(student_id_to_name).map(function (key) {
              <li>{student_id_to_name[key]}</li>;
            })}
          </ul>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          <Container socket={socket} user_id={user_id} />
        </Main>
      </Box>
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
