import { styled } from '@mui/material/styles'
import { Container, CircularProgress, Typography } from '@mui/material'

const CustomLoader = styled(CircularProgress)(({ theme }) => ({
  color: theme.palette.secondary.main
}))

export const Loader = ({ title, fullSize = true }) => {
  return (
    <Container
      sx={{
        width: fullSize ? '100%' : 'auto',
        height: fullSize ? '100vh' : 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: title ? '2rem' : '0'
      }}
    >
      <CustomLoader disableShrink size={fullSize ? '4rem' : '1.5rem'} />
      {title && (
        <Typography
          variant="h5"
          component="h2"
          sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }}
        >
          {title}
        </Typography>
      )}
    </Container>
  )
}
