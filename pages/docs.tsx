import * as React from 'react';
import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '../components/Link';
import IconButton from '@mui/material/IconButton';
import MainMenu from '../components/MainMenu';

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
  const [mainMenuOpen, setMainMenuOpen] = React.useState(false);
  const openMainMenu = () => setMainMenuOpen(true);
  const closeMainMenu = () => setMainMenuOpen(false);
  return <>
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
    <style global jsx>{`
      html, body {
        background-color: #fff !important
      }
    `}</style>
    <SwaggerUI spec={spec} />
  </>;
};

export const getStaticProps: GetStaticProps = async ctx => {
  const spec: Record<string, any> = createSwaggerSpec({
    title: 'Fnordcredit API',
    version: 'v1',
  });
  return {
    props: {
      spec,
    },
  };
};

export default ApiDoc;
