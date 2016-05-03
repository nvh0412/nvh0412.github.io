import React from 'react';
import AppBar from 'material-ui/AppBar';

import {grey50, grey900} from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

const muiTheme = getMuiTheme({
  fontFamily: 'Roboto',
  appBar: {
    height: 50,
    color: grey50,
    textColor: grey900
  }
});

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <AppBar
          title="Passionate Programmer"
        />
      </MuiThemeProvider>
    )
  }
}
