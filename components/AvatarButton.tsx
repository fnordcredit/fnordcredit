import * as React from "react";
import ButtonBase from '@mui/material/ButtonBase';
import Typography from "@mui/material/Typography";
import useTheme from "@mui/styles/useTheme";
import Avatar from "@mui/material/Avatar";
import Stack from '@mui/material/Stack';

type Props = {
  text: string,
  image?: string | null,
  onClick?: () => void,
};

const AvatarButton: FunctionComponent<Props> = (props) => {
  const theme = useTheme();
  return (
    <ButtonBase onClick={props.onClick} sx={{
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
          zIndex: 1
        }}>
          {props.text}
        </Typography>
      </Stack>
    </ButtonBase>
  );
};

export default AvatarButton;
