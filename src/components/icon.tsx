import {
  AccessTimeOutlined,
  AddOutlined,
  BorderColorOutlined,
  CheckCircleOutline,
  ContentCopyOutlined,
  CopyrightOutlined,
  DeleteOutline,
  ErrorOutline,
  EventAvailableOutlined,
  SlideshowOutlined
} from '@mui/icons-material'
import { Grid, SvgIconTypeMap } from '@mui/material'

import { ContextMenuItem } from 'rctx-contextmenu'

type IconProps = Omit<SvgIconTypeMap['props'], 'children'> & {
  code: 'edit' | 'add' | 'warn-cirlce' | 'check-circle' | 'delete' | 'copy' | 'time' | 'calendar' | 'brand' | 'film'
  style?: React.CSSProperties
}
export default function Icon({ code, ...other }: IconProps) {
  switch (code) {
    case 'edit':
      return <BorderColorOutlined {...other} />
    case 'add':
      return <AddOutlined {...other} />
    case 'warn-cirlce':
      return <ErrorOutline {...other} />
    case 'check-circle':
      return <CheckCircleOutline {...other} />
    case 'delete':
      return <DeleteOutline {...other} />
    case 'copy':
      return <ContentCopyOutlined {...other} />
    case 'time':
      return <AccessTimeOutlined {...other} />
    case 'calendar':
      return <EventAvailableOutlined {...other} />
    case 'brand':
      return <CopyrightOutlined {...other} />
    case 'film':
      return <SlideshowOutlined {...other} />
  }
}

type IconWithTextProps = Omit<ContextMenuItem, 'className' | 'children'> & {
  icon: IconProps['code']
  text: string
  component: React.ElementType
}
export function IconWithText({ icon: code, text, component, ...other }: IconWithTextProps) {
  return (
    <Grid item component={component} alignItems='center' className='d-flex' {...other}>
      <Icon code={code} style={{ marginRight: 6 }} /> {text}
    </Grid>
  )
}
