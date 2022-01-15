import { GetStaticProps, InferGetStaticPropsType } from 'next';
import { createSwaggerSpec } from 'next-swagger-doc';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import AppsIcon from '@mui/icons-material/Apps';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Link from '../components/Link';
import IconButton from '@mui/material/IconButton';

const ApiDoc = ({ spec }: InferGetStaticPropsType<typeof getStaticProps>) => {
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
            component={Link}
            href="/"
          >
            <AppsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
    </Box>
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
