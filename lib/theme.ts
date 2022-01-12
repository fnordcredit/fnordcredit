import { createTheme } from '@mui/material/styles';
import { red, lightBlue, pink } from '@mui/material/colors';

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: lightBlue,
    secondary: pink,
    error: {
      main: red.A400,
    },
    mode: "dark"
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#2e4783 !important"
        }
      },
      defaultProps: {
        enableColorOnDark: true
      }
    }
  },
});

export default theme;
