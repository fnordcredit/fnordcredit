import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Link from '../components/Link';
import { useTranslation } from 'next-i18next';

import CodeIcon from '@mui/icons-material/Code';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeIcon from '@mui/icons-material/Home';

type MainMenuProps = {
  open: boolean,
  onClose: () => void
};

const MainMenu = (props: MainMenuProps) => {
  const { t } = useTranslation("common");
  return (
    <Drawer anchor="left" open={props.open} onClose={props.onClose}>
      <List>
        <ListItemButton component={Link} href="/" onClick={props.onClose}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>
            {t("menu.home")}
          </ListItemText>
        </ListItemButton>
        <Divider />
        <ListItemButton component={Link} href="https://github.com/Fnordcredit/Fnordcredit">
          <ListItemIcon>
            <GitHubIcon />
          </ListItemIcon>
          <ListItemText>
            {t("menu.github")}
          </ListItemText>
        </ListItemButton>
        <ListItemButton component={Link} href="/docs" onClick={props.onClose}>
          <ListItemIcon>
            <CodeIcon />
          </ListItemIcon>
          <ListItemText>
            {t("menu.api-docs")}
          </ListItemText>
        </ListItemButton>
      </List>
    </Drawer>
  );
};

export default MainMenu;
