import { SvgIcon, SvgIconProps } from '@material-ui/core';

import * as React from 'react';

const HomeRepairService = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <g>
      <polygon points="18,16 16,16 16,15 8,15 8,16 6,16 6,15 2,15 2,20 22,20 22,15 18,15" />
      <path d="M20,8h-3V6c0-1.1-0.9-2-2-2H9C7.9,4,7,4.9,7,6v2H4c-1.1,0-2,0.9-2,2v4h4v-2h2v2h8v-2h2v2h4v-4C22,8.9,21.1,8,20,8z M15,8 H9V6h6V8z" />
    </g>
  </SvgIcon>
);

export default HomeRepairService;
