import React from 'react';
import { SvgIcon } from '@mui/material';

const MountainLogo = (props) => {
  return (
    <SvgIcon {...props} viewBox="0 0 200 50" sx={{ fontSize: '200px', ...props.sx }}>
      {/* רכס הרים אלגנטי */}
      <path
        d="M10 35 L40 15 L70 35 L100 10 L130 35 L160 15 L190 35"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
};

export default MountainLogo;
