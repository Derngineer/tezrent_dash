// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const StyledHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: 100%;
  flex-shrink: 0;
  min-block-size: var(--header-height);
  background-color: ${({ theme }) => theme.palette.mode === 'dark' ? '#1e1e2d' : '#ffffff'};
  border-bottom: 1px solid ${({ theme }) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
  box-shadow: ${({ theme }) => theme.palette.mode === 'dark' 
    ? '0 2px 8px rgba(0, 0, 0, 0.3)' 
    : '0 2px 8px rgba(0, 0, 0, 0.04)'};
  z-index: 10;

  .${verticalLayoutClasses.navbar} {
    position: relative;
    padding-block: 10px;
    padding-inline: ${themeConfig.layoutPadding}px;
    inline-size: 100%;
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  }

  ${({ overrideStyles }) => overrideStyles}
`

export default StyledHeader
