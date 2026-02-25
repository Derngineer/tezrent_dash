'use client'

import { useState, useRef, useEffect } from 'react'

import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'

import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

import Link from '@components/Link'
import api, { authAPI } from '@/services/api'

const BRAND_BLUE = '#696cff'

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;

  @media (max-width: 968px) {
    flex-direction: column;
  }
`

const ImageSection = styled.div`
  flex: 1;
  position: relative;
  background: linear-gradient(135deg, ${BRAND_BLUE}22 0%, ${BRAND_BLUE}44 100%);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  overflow: hidden;

  @media (max-width: 968px) {
    min-height: 300px;
    padding: 40px;
  }
`

const ImageOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
    radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
`

const StockImage = styled(Image)`
  object-fit: cover;
  z-index: 0;
`

const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: #ffffff;
`

const WelcomeTitle = styled.h1`
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);

  @media (max-width: 968px) {
    font-size: 36px;
  }
`

const WelcomeSubtitle = styled.p`
  font-size: 20px;
  opacity: 0.95;
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.3);

  @media (max-width: 968px) {
    font-size: 16px;
  }
`

const FormSection = styled.div`
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  padding: 24px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Logo = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: ${BRAND_BLUE};
`

const ProgressContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: #e0e0e0;
  z-index: 1000;
`

const ProgressBar = styled.div`
  height: 100%;
  background: ${BRAND_BLUE};
  transition: width 0.3s ease;
  width: ${props => props.progress}%;
`

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px;
  max-width: 500px;
  margin: 0 auto;
  width: 100%;
`

const QuestionContainer = styled.div`
  animation: ${fadeIn} 0.4s ease-out;
`

const Question = styled.h1`
  font-size: 32px;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 40px;
  line-height: 1.3;
`

const TextInput = styled.input`
  width: 100%;
  padding: 16px 0;
  font-size: 24px;
  border: none;
  border-bottom: 2px solid #e0e0e0;
  background: transparent;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-bottom-color: ${BRAND_BLUE};
  }

  &::placeholder {
    color: #bbb;
  }
`

const OTPContainer = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-start;
`

const OTPInput = styled.input`
  width: 56px;
  height: 64px;
  font-size: 28px;
  text-align: center;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  background: transparent;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.2s;

  &:focus {
    border-color: ${BRAND_BLUE};
  }
`

const ButtonContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 40px;
`

const ContinueButton = styled.button`
  padding: 16px 40px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  background: ${BRAND_BLUE};
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #5a5de8;
  }

  &:disabled {
    background: #e0e0e0;
    color: #999;
    cursor: not-allowed;
  }
`

const BackButton = styled.button`
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;

  &:hover {
    color: #1a1a1a;
  }
`

const TextButton = styled.button`
  background: none;
  border: none;
  color: ${BRAND_BLUE};
  font-size: 14px;
  cursor: pointer;
  padding: 0;
  margin-top: 20px;
  display: block;

  &:hover {
    text-decoration: underline;
  }

  &:disabled {
    color: #999;
    cursor: not-allowed;
  }
`

const ErrorMessage = styled.p`
  color: #e53935;
  font-size: 14px;
  margin-top: 8px;
`

const SuccessMessage = styled.p`
  color: #43a047;
  font-size: 14px;
  margin-top: 8px;
`

const HelperText = styled.p`
  color: #888;
  font-size: 14px;
  margin-top: 16px;
`

const Footer = styled.footer`
  padding: 24px 40px;
  text-align: center;
`

const FooterLink = styled.span`
  color: #666;
  font-size: 14px;

  a {
    color: ${BRAND_BLUE};
    text-decoration: none;
    font-weight: 500;
  }

  a:hover {
    text-decoration: underline;
  }
`

const STEPS = [
  { key: 'email', question: "What's your email?", placeholder: 'john@company.com', type: 'email' },
  { key: 'otp', question: 'Enter the code we sent you', type: 'otp' },
  { key: 'password', question: 'Enter your password', placeholder: 'Your password', type: 'password' }
]

const Login = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inputRef = useRef(null)
  const otpRefs = useRef([])

  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const progress = ((currentStep + 1) / 3) * 100
  const registered = searchParams.get('registered')

  useEffect(() => {
    if (registered) {
      setSuccess('Account created successfully! Please sign in.')
    }
  }, [registered])

  useEffect(() => {
    if (currentStep === 0 && inputRef.current) {
      inputRef.current.focus()
    }

    if (currentStep === 1 && otpRefs.current[0]) {
      otpRefs.current[0].focus()
    }

    if (currentStep === 2 && inputRef.current) {
      inputRef.current.focus()
    }
  }, [currentStep])

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)

      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleEmailSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')

      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authAPI.requestOTP(email)
      setCountdown(60)
      setCurrentStep(1)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]

    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    setError('')

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOTPKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }

    if (e.key === 'Enter' && otp.join('').length === 6) {
      handleOTPSubmit()
    }
  }

  const handleOTPPaste = e => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)

    if (pasted.length === 6) {
      const newOtp = pasted.split('')

      setOtp(newOtp)
      otpRefs.current[5]?.focus()
    }
  }

  const handleOTPSubmit = async () => {
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit code')

      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await authAPI.verifyOTP(email, otpCode)

      localStorage.setItem('accessToken', response.data.access)
      localStorage.setItem('refreshToken', response.data.refresh)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError('Please enter your password')

      return
    }

    setIsLoading(true)
    setError('')

    try {
      await authAPI.login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || 'Invalid credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return

    setIsLoading(true)
    setError('')

    try {
      await authAPI.requestOTP(email)
      setCountdown(60)
      setSuccess('New code sent!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to resend code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUsePassword = () => {
    setError('')
    setCurrentStep(2)
  }

  const handleBack = () => {
    setError('')

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()

      if (currentStep === 0) handleEmailSubmit()
      else if (currentStep === 2) handlePasswordSubmit()
    }
  }

  const renderInput = () => {
    const step = STEPS[currentStep]

    if (step.type === 'otp') {
      return (
        <>
          <OTPContainer onPaste={handleOTPPaste}>
            {otp.map((digit, index) => (
              <OTPInput
                key={index}
                ref={el => (otpRefs.current[index] = el)}
                type='text'
                inputMode='numeric'
                maxLength={1}
                value={digit}
                onChange={e => handleOTPChange(index, e.target.value)}
                onKeyDown={e => handleOTPKeyDown(index, e)}
              />
            ))}
          </OTPContainer>
          <TextButton onClick={handleResendOTP} disabled={countdown > 0 || isLoading}>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </TextButton>
          <TextButton onClick={handleUsePassword}>Use password instead</TextButton>
        </>
      )
    }

    return (
      <TextInput
        ref={inputRef}
        type={step.type}
        placeholder={step.placeholder}
        value={currentStep === 0 ? email : password}
        onChange={e => {
          setError('')

          if (currentStep === 0) setEmail(e.target.value)
          else setPassword(e.target.value)
        }}
        onKeyDown={handleKeyDown}
      />
    )
  }

  const handleContinue = () => {
    if (currentStep === 0) handleEmailSubmit()
    else if (currentStep === 1) handleOTPSubmit()
    else handlePasswordSubmit()
  }

  return (
    <PageWrapper>
      <ImageSection>
        <StockImage src='/images/illustrations/objects/stock.jpg' alt='Welcome back' fill priority />
        <ImageOverlay />
        <WelcomeContent>
          <WelcomeTitle>Welcome Back</WelcomeTitle>
          <WelcomeSubtitle>Sign in to continue to your dashboard</WelcomeSubtitle>
        </WelcomeContent>
      </ImageSection>
      <FormSection>
        <ProgressContainer>
          <ProgressBar progress={progress} />
        </ProgressContainer>
        <Header>
          <Logo>tezrent</Logo>
        </Header>
        <Main>
          <QuestionContainer key={currentStep}>
            <Question>{STEPS[currentStep].question}</Question>
            {renderInput()}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
            {STEPS[currentStep].type !== 'otp' && <HelperText>Press Enter to continue</HelperText>}
            <ButtonContainer>
              {currentStep > 0 && <BackButton onClick={handleBack}>Back</BackButton>}
              <ContinueButton onClick={handleContinue} disabled={isLoading}>
                {isLoading ? 'Please wait...' : 'Continue'}
              </ContinueButton>
            </ButtonContainer>
          </QuestionContainer>
        </Main>
        <Footer>
          <FooterLink>
            {"Don't have an account? "}
            <Link href='/register'>Sign up</Link>
          </FooterLink>
        </Footer>
      </FormSection>
    </PageWrapper>
  )
}

export default Login
