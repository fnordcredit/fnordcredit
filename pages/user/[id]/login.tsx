import * as React from "react";
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MainMenu from '../../../components/MainMenu';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import CardActions from "@mui/material/CardActions";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import prisma from '../../../lib/prisma';
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Link from "../../../components/Link";
import Avatar from "@mui/material/Avatar";

type LoginProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Login = ({ user }: LoginProps) => {
  const [mainMenuOpen, setMainMenuOpen] = React.useState(false);
  const openMainMenu = () => setMainMenuOpen(true);
  const closeMainMenu = () => setMainMenuOpen(false);
  return (
    <>
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
          </Toolbar>
        </AppBar>
      </Box>
      <MainMenu open={mainMenuOpen} onClose={closeMainMenu} />
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Card>
            <Box sx={{ display: "flex" }}>
              <Avatar
                variant="rounded"
                sx={{ width: 128, height: 128, m: 1 }}
                src={user?.avatar}
                alt={user?.name}
              />
              <CardContent>
                <Typography variant="h4">
                  {`Welcome back, ${user?.name}!`}
                </Typography>
                {`Last login: ${new Date(user?.updatedAt)}`}
              </CardContent>
            </Box>
            <Box>
              <CardActions>
                <Button component={Link} href="/">
                  Change User
                </Button>
                <Button variant="contained" sx={{ marginLeft: "auto" }}>
                  Login
                </Button>
              </CardActions>
            </Box>
          </Card>
        </Box>
      </Container>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const userId: string = ctx?.params?.id?.toString() ?? "0";
  const user = await prisma.user.findUnique({
    where: {
      id: parseInt(userId, 10)
    }
  });
  const translations = await serverSideTranslations(ctx.locale, [
    "common"
  ]);
  return {
    props: {
      ...translations,
      user: user != null ? {
        ...user,
        createdAt: user?.createdAt?.toISOString(),
        updatedAt: user?.updatedAt?.toISOString(),
      } : null
    }
  };
}

export default Login;
