import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '../components/Link';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import CreateAccountDialog from '../components/CreateAccountDialog';
import AvatarButton from '../components/AvatarButton';
import prisma from '../lib/prisma.ts';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';

type UserListProps = {
  users: User[]
};

const UserList: NextPage = (props: UserListProps) => {
  const [mainMenuOpen, setMainMenuOpen] = React.useState(false);
  const openMainMenu = () => setMainMenuOpen(true);
  const closeMainMenu = () => setMainMenuOpen(false);
  return [
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2, color: "#ffffff" }}
            onClick={openMainMenu}
          >
            <MenuIcon />
          </IconButton>
          <Autocomplete
            id="free-solo-demo"
            freeSolo
            options={[] /*top100Films.map((option) => option.title)*/}
            renderInput={(params) => <TextField {...params} label="Search User" />}
            sx={{ flexGrow: 1, mr: 4 }}
          />
          <CreateAccountDialog />
        </Toolbar>
      </AppBar>
    </Box>,
    <Drawer anchor="left" open={mainMenuOpen} onClose={closeMainMenu}>
      <List>
        <ListItemButton component={Link} href="https://github.com/Fnordcredit/Fnordcredit">
          <ListItemIcon>
            <GitHubIcon />
          </ListItemIcon>
          <ListItemText>
            Contribute on GitHub
          </ListItemText>
        </ListItemButton>
        <ListItemButton component={Link} href="/docs">
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <ListItemText>
            API Docs
          </ListItemText>
        </ListItemButton>
      </List>
    </Drawer>,
    <Container maxWidth="lg">
      <Box sx={{ m: 4, display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        {props.users.map((user) => (
          <AvatarButton key={user.id} text={user.name} image={user.avatar} />
        ))}
      </Box>
    </Container>
  ];
};

// TODO: Replace user fetching with SWR and regular revalidation
export const getServerSideProps = async () => {
  const users = await prisma.user.findMany()
  return { props: { users: users.map((user) => ({
    ...user,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  })) } };
}

export default UserList;
