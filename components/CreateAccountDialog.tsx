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
import { useTranslation } from 'next-i18next';

export default function FormDialog() {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const router = useRouter();
  const [e] = useTranslation("error");
  const [t] = useTranslation("user", { keyPrefix: "create-dialog" });

  const runApiRequest = async (dryRun: boolean, newName: string | null) => {
    const res = await fetch(`/api/v1/user?dryRun=${dryRun}`, {
      body: JSON.stringify({
        name: newName ?? name
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
      const errMsg = (await res.json()).message;
      setError(e(errMsg || "An unknown error occured"));
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
      const errMsg = (await res.json()).message;
      setError(e(errMsg || "An unknown error occured"));
    }
  };

  return (
    <div>
      <Button variant="contained" endIcon={<PersonAddAlt1Icon />} onClick={handleClickOpen}>
        {t("new-account")}
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{t("dialog-title")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("dialog-text")}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label={t("name")}
            fullWidth
            variant="standard"
            onChange={handleChange}
            value={name}
            error={error !== ""}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={handleClose} disabled>{t("customize")}</Button>
          <Button onClick={handleSubmit}>{t("create-account")}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
