'use client'

import { useState, useRef, useEffect } from 'react'

import Image from 'next/image'
import { useRouter } from 'next/navigation'

import styled from '@emotion/styled'
import { keyframes } from '@emotion/react'

import Link from '@components/Link'
import api from '@/services/api'

const BRAND_BLUE = '#696cff'

const COUNTRIES = [
  { value: 'UAE', label: 'United Arab Emirates' },
  { value: 'UZB', label: 'Uzbekistan' }
]

const CITIES_BY_COUNTRY = {
  UAE: [
    { value: 'DXB', label: 'Dubai' },
    { value: 'AUH', label: 'Abu Dhabi' },
    { value: 'SHJ', label: 'Sharjah' },
    { value: 'AJM', label: 'Ajman' },
    { value: 'UAQ', label: 'Umm Al Quwain' },
    { value: 'FUJ', label: 'Fujairah' },
    { value: 'RAK', label: 'Ras Al Khaimah' }
  ],
  UZB: [
    { value: 'TAS', label: 'Tashkent' },
    { value: 'SAM', label: 'Samarkand' },
    { value: 'NAM', label: 'Namangan' },
    { value: 'AND', label: 'Andijan' }
  ]
}

const BUSINESS_TYPES = [
  { value: 'rental', label: 'Equipment Rental' },
  { value: 'construction', label: 'Construction' },
  { value: 'events', label: 'Events & Entertainment' },
  { value: 'logistics', label: 'Logistics' },
  { value: 'other', label: 'Other' }
]

const QUESTIONS = [
  {
    key: 'company_name',
    question: "What's your company name?",
    placeholder: 'Acme Equipment Rentals',
    type: 'text',
    required: true
  },
  {
    key: 'business_type',
    question: 'What type of business are you in?',
    type: 'select',
    options: 'BUSINESS_TYPES',
    required: true
  },
  {
    key: 'country',
    question: 'Which country is your business located in?',
    type: 'select',
    options: 'COUNTRIES',
    required: true
  },
  { key: 'city', question: 'Which city?', type: 'select', options: 'CITIES', dynamic: true, required: true },
  {
    key: 'company_address',
    question: "What's your business address?",
    placeholder: '123 Industrial Area',
    type: 'text',
    required: true
  },
  {
    key: 'phone_number',
    question: "What's your phone number?",
    placeholder: '+971 50 123 4567',
    type: 'tel',
    required: true
  },
  {
    key: 'tax_number',
    question: 'Tax registration number?',
    placeholder: 'TRN123456789 (optional)',
    type: 'text',
    required: false
  },
  { key: 'first_name', question: "What's your first name?", placeholder: 'John', type: 'text', required: true },
  { key: 'last_name', question: 'And your last name?', placeholder: 'Smith', type: 'text', required: true },
  {
    key: 'email',
    question: "What's your email address?",
    placeholder: 'john@company.com',
    type: 'email',
    required: true
  },
  {
    key: 'password',
    question: 'Create a password',
    placeholder: '8+ characters',
    type: 'password',
    required: true
  },
  {
    key: 'confirmPassword',
    question: 'Confirm your password',
    placeholder: 'Re-enter password',
    type: 'password',
    required: true
  }
]

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

const SelectContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`

const SelectOption = styled.button`
  padding: 14px 24px;
  font-size: 16px;
  border: 2px solid ${props => (props.selected ? BRAND_BLUE : '#e0e0e0')};
  border-radius: 8px;
  background: ${props => (props.selected ? BRAND_BLUE : 'transparent')};
  color: ${props => (props.selected ? '#ffffff' : '#1a1a1a')};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
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

const SkipButton = styled.button`
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: transparent;
  color: #666;
  cursor: pointer;

  &:hover {
    border-color: #ccc;
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

const ErrorMessage = styled.p`
  color: #e53935;
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

const Register = () => {
  const router = useRouter()
  const inputRef = useRef(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const currentQuestion = QUESTIONS[currentStep]
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100

  const getCityOptions = () => {
    const country = formData.country

    return country ? CITIES_BY_COUNTRY[country] || [] : []
  }

  const getOptions = () => {
    if (currentQuestion.key === 'city') return getCityOptions()
    if (currentQuestion.options === 'BUSINESS_TYPES') return BUSINESS_TYPES
    if (currentQuestion.options === 'COUNTRIES') return COUNTRIES

    return []
  }

  useEffect(() => {
    if (inputRef.current && currentQuestion.type !== 'select') {
      inputRef.current.focus()
    }
  }, [currentStep, currentQuestion.type])

  const validateField = () => {
    const value = formData[currentQuestion.key]

    if (currentQuestion.required && !value) {
      setError('This field is required')

      return false
    }

    if (currentQuestion.key === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(value)) {
        setError('Please enter a valid email address')

        return false
      }
    }

    if (currentQuestion.key === 'password' && value && value.length < 8) {
      setError('Password must be at least 8 characters')

      return false
    }

    if (currentQuestion.key === 'confirmPassword' && value !== formData.password) {
      setError('Passwords do not match')

      return false
    }

    setError('')

    return true
  }

  const handleContinue = async () => {
    if (!validateField()) return

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      await handleSubmit()
    }
  }

  const handleSkip = () => {
    if (!currentQuestion.required) {
      setError('')

      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setError('')
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { confirmPassword, ...submitData } = formData

      await api.post('/accounts/register/company/', submitData)
      router.push('/login?registered=true')
    } catch (err) {
      const errorData = err.response?.data

      if (errorData) {
        const firstError = Object.values(errorData)[0]

        setError(Array.isArray(firstError) ? firstError[0] : firstError)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = value => {
    setFormData(prev => ({ ...prev, [currentQuestion.key]: value }))
    setError('')
  }

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleContinue()
    }
  }

  const handleSelectOption = value => {
    setFormData(prev => ({ ...prev, [currentQuestion.key]: value }))
    setError('')

    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1)
      }
    }, 200)
  }

  const renderInput = () => {
    if (currentQuestion.type === 'select') {
      const options = getOptions()

      return (
        <SelectContainer>
          {options.map(option => (
            <SelectOption
              key={option.value}
              selected={formData[currentQuestion.key] === option.value}
              onClick={() => handleSelectOption(option.value)}
            >
              {option.label}
            </SelectOption>
          ))}
        </SelectContainer>
      )
    }

    return (
      <TextInput
        ref={inputRef}
        type={currentQuestion.type}
        placeholder={currentQuestion.placeholder}
        value={formData[currentQuestion.key] || ''}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    )
  }

  return (
    <PageWrapper>
      <ImageSection>
        <StockImage src='/images/illustrations/objects/stock.jpg' alt='Join us' fill priority />
        <ImageOverlay />
        <WelcomeContent>
          <WelcomeTitle>Join Us</WelcomeTitle>
          <WelcomeSubtitle>Create your account and start managing your rentals</WelcomeSubtitle>
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
            <Question>{currentQuestion.question}</Question>
            {renderInput()}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {currentQuestion.type !== 'select' && <HelperText>Press Enter to continue</HelperText>}
            <ButtonContainer>
              {currentStep > 0 && <BackButton onClick={handleBack}>Back</BackButton>}
              {!currentQuestion.required && currentQuestion.type !== 'select' && (
                <SkipButton onClick={handleSkip}>Skip</SkipButton>
              )}
              {currentQuestion.type !== 'select' && (
                <ContinueButton onClick={handleContinue} disabled={isLoading}>
                  {isLoading ? 'Please wait...' : currentStep === QUESTIONS.length - 1 ? 'Create Account' : 'Continue'}
                </ContinueButton>
              )}
            </ButtonContainer>
          </QuestionContainer>
        </Main>
        <Footer>
          <FooterLink>
            Already have an account? <Link href='/login'>Sign in</Link>
          </FooterLink>
        </Footer>
      </FormSection>
    </PageWrapper>
  )
}

export default Register
