import * as React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="contained" endIcon={<PersonAddAlt1Icon />} onClick={handleClickOpen}>
        New Account
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create an Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To create an account, just fill in your username. You can choose to
            get started immediately or to customize your account first.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Your name"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleClose} disabled>Customize</Button>
          <Button onClick={handleClose}>Create Account</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
