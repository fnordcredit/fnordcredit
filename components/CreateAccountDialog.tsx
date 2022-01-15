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
import { useRouter } from 'next/router';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const router = useRouter();

  const runApiRequest = async (dryRun: boolean, newName: string | null) => {
    const res = await fetch("/api/v1/user", {
      body: JSON.stringify({
        name: newName ?? name,
        dryRun: dryRun
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    if (res.ok) {
      setError("");
      if (!dryRun) {
        const user = await res.json();
        router.push(`/user/${user.id}`);
      }
    } else {
      if (res.status === 400 || res.status === 409) {
        const errMsg = (await res.json()).error;
        setError(errMsg || "An unknown error occured");
      }
      else {
        setError("An unknown error occured");
      }
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
    runApiRequest(true, event.target.value);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => runApiRequest(false);

  const handleCreate = async () => {
    const res = await fetch("/api/v1/user", {
      body: JSON.stringify({
        name: name
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    if (res.ok) {
      const user = res.json();
    } else {
      console.log("An error occured");
    }
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
            onChange={handleChange}
            value={name}
            error={error !== ""}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleClose} disabled>Customize</Button>
          <Button onClick={handleSubmit}>Create Account</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
