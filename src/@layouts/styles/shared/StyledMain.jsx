// Third-party Imports
import styled from '@emotion/styled'

// Config Imports
import themeConfig from '@configs/themeConfig'

const StyledMain = styled.main`
  padding: ${themeConfig.layoutPadding}px;
  background-color: ${({ theme }) => theme.palette.mode === 'dark' ? '#121212' : '#f5f5f9'};
  min-height: calc(100vh - 64px);
  ${({ isContentCompact }) =>
    isContentCompact &&
    `
    margin-inline: auto;
    max-inline-size: ${themeConfig.compactContentWidth}px;
  `}
`

export default StyledMain
