import * as React from 'react';
import type { NextPage } from 'next';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CreateAccountDialog from '../components/CreateAccountDialog';
import AvatarButton from '../components/AvatarButton';
import prisma from '../lib/prisma.ts';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import MainMenu from '../components/MainMenu';
import SearchBar from '../components/SearchBar';

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
          <SearchBar options={props.users.map((user) => user.name)} />
          <div style={{ flexGrow: 1 }} />
          <CreateAccountDialog />
        </Toolbar>
      </AppBar>
    </Box>,
    <MainMenu open={mainMenuOpen} onClose={closeMainMenu} />,
    <Container maxWidth="lg">
      <Box sx={{ m: 4, display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        {props.users.map((user) => (
          <AvatarButton
            key={user.id}
            text={user.name}
            image={user.avatar}
            href={`/user/${user.id}`} />
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
