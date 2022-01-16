import * as React from "react";
import ButtonBase from '@mui/material/ButtonBase';
import Typography from "@mui/material/Typography";
import useTheme from "@mui/styles/useTheme";
import Avatar from "@mui/material/Avatar";
import Stack from '@mui/material/Stack';
import Link from './Link';

type Props = {
  text: string,
  image?: string | null,
  href: string
};

const AvatarButton: FunctionComponent<Props> = (props) => {
  const theme = useTheme();
  return (
    <ButtonBase component={Link} href={props.href} sx={{
      m: 1
    }}>
      <Stack>
        <Avatar src={props.image} variant="rounded" sx={{
            width: 96,
            height: 96,
            bgcolor: '#2e4763',
            color: '#ffffff'
        }} alt={props.text} />
        <Typography align="center" sx={{
          bgcolor: theme.palette.background.default,
          zIndex: 1,
          maxWidth: 102
        }} variant="body1" noWrap>
          {props.text}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};

export default AvatarButton;
