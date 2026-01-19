import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCreditCard, FiLock, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import './PaymentForm.css';

// Card type detection patterns
const CARD_PATTERNS = {
    visa: /^4/,
    mastercard: /^5[1-5]|^2[2-7]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
};

// Test cards for demo
const TEST_CARDS = {
    success: ['4242424242424242', '5555555555554444', '378282246310005'],
    decline: ['4000000000000002', '4000000000009995'],
    insufficient: ['4000000000009995'],
    expired: ['4000000000000069'],
};

interface PaymentFormProps {
    amount: number;
    onPaymentSuccess: () => void;
    onPaymentError: (error: string) => void;
    disabled?: boolean;
}

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export const PaymentForm = ({ amount, onPaymentSuccess, onPaymentError, disabled }: PaymentFormProps) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardType, setCardType] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [step, setStep] = useState<PaymentStep>('form');
    const [processingStep, setProcessingStep] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    // Detect card type
    useEffect(() => {
        const number = cardNumber.replace(/\s/g, '');
        if (number.length >= 1) {
            for (const [type, pattern] of Object.entries(CARD_PATTERNS)) {
                if (pattern.test(number)) {
                    setCardType(type);
                    return;
                }
            }
        }
        setCardType(null);
    }, [cardNumber]);

    // Format card number with spaces
    const formatCardNumber = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];

        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }

        if (parts.length) {
            return parts.join(' ');
        } else {
            return v;
        }
    };

    // Format expiry date
    const formatExpiryDate = (value: string) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    // Luhn algorithm validation
    const validateLuhn = (number: string): boolean => {
        const digits = number.replace(/\s/g, '');
        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        const cleanCardNumber = cardNumber.replace(/\s/g, '');

        if (!cleanCardNumber || cleanCardNumber.length < 15) {
            newErrors.cardNumber = 'Please enter a valid card number';
        } else if (!validateLuhn(cleanCardNumber)) {
            newErrors.cardNumber = 'Invalid card number';
        }

        if (!cardHolder.trim()) {
            newErrors.cardHolder = 'Cardholder name is required';
        }

        if (!expiryDate || expiryDate.length < 5) {
            newErrors.expiryDate = 'Please enter expiry date (MM/YY)';
        } else {
            const [month, year] = expiryDate.split('/');
            const currentYear = new Date().getFullYear() % 100;
            const currentMonth = new Date().getMonth() + 1;
            
            if (parseInt(month) < 1 || parseInt(month) > 12) {
                newErrors.expiryDate = 'Invalid month';
            } else if (parseInt(year) < currentYear || 
                      (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                newErrors.expiryDate = 'Card has expired';
            }
        }

        if (!cvv || cvv.length < 3) {
            newErrors.cvv = 'Please enter CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Simulate payment processing
    const processPayment = async () => {
        if (!validateForm()) return;

        setStep('processing');
        const cleanCardNumber = cardNumber.replace(/\s/g, '');

        // Simulate processing steps
        const steps = [
            'Encrypting card data...',
            'Connecting to payment gateway...',
            'Verifying card details...',
            'Authorizing payment...',
            'Processing transaction...',
        ];

        for (let i = 0; i < steps.length; i++) {
            setProcessingStep(i);
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
        }

        // Check test card scenarios
        if (TEST_CARDS.decline.includes(cleanCardNumber)) {
            setErrorMessage('Card declined. Please try a different card.');
            setStep('error');
            return;
        }

        if (TEST_CARDS.insufficient.includes(cleanCardNumber)) {
            setErrorMessage('Insufficient funds. Please try a different card.');
            setStep('error');
            return;
        }

        if (TEST_CARDS.expired.includes(cleanCardNumber)) {
            setErrorMessage('This card has expired. Please use a different card.');
            setStep('error');
            return;
        }

        // Success!
        setStep('success');
        await new Promise(resolve => setTimeout(resolve, 1500));
        onPaymentSuccess();
    };

    const handleRetry = () => {
        setStep('form');
        setProcessingStep(0);
        setErrorMessage('');
    };

    const processingSteps = [
        'Encrypting card data...',
        'Connecting to payment gateway...',
        'Verifying card details...',
        'Authorizing payment...',
        'Processing transaction...',
    ];

    // Card type icons/colors
    const getCardBrandStyles = () => {
        switch (cardType) {
            case 'visa':
                return { color: '#1A1F71', label: 'VISA' };
            case 'mastercard':
                return { color: '#EB001B', label: 'Mastercard' };
            case 'amex':
                return { color: '#006FCF', label: 'AMEX' };
            case 'discover':
                return { color: '#FF6000', label: 'Discover' };
            default:
                return { color: 'var(--text-secondary)', label: '' };
        }
    };

    const cardBrand = getCardBrandStyles();

    return (
        <div className="payment-form-container">
            <AnimatePresence mode="wait">
                {step === 'form' && (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="payment-form"
                    >
                        {/* Test Card Info Banner */}
                        <div className="test-card-banner">
                            <FiAlertCircle />
                            <div>
                                <strong>Demo Mode</strong>
                                <p>Use test card: <code>4242 4242 4242 4242</code></p>
                            </div>
                        </div>

                        {/* Card Preview */}
                        <div className={`card-preview ${cardType || ''}`}>
                            <div className="card-chip"></div>
                            <div className="card-number-preview">
                                {cardNumber || '•••• •••• •••• ••••'}
                            </div>
                            <div className="card-details-preview">
                                <div>
                                    <span className="label">Card Holder</span>
                                    <span className="value">{cardHolder || 'YOUR NAME'}</span>
                                </div>
                                <div>
                                    <span className="label">Expires</span>
                                    <span className="value">{expiryDate || 'MM/YY'}</span>
                                </div>
                            </div>
                            {cardType && (
                                <div className="card-brand" style={{ color: cardBrand.color }}>
                                    {cardBrand.label}
                                </div>
                            )}
                        </div>

                        {/* Card Number Input */}
                        <div className="form-group">
                            <label>Card Number</label>
                            <div className={`input-wrapper ${errors.cardNumber ? 'error' : ''}`}>
                                <FiCreditCard className="input-icon" />
                                <input
                                    type="text"
                                    placeholder="4242 4242 4242 4242"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    maxLength={19}
                                    disabled={disabled}
                                />
                                {cardType && (
                                    <span className="card-type-badge" style={{ background: cardBrand.color }}>
                                        {cardBrand.label}
                                    </span>
                                )}
                            </div>
                            {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                        </div>

                        {/* Cardholder Name */}
                        <div className="form-group">
                            <label>Cardholder Name</label>
                            <div className={`input-wrapper ${errors.cardHolder ? 'error' : ''}`}>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={cardHolder}
                                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                                    disabled={disabled}
                                />
                            </div>
                            {errors.cardHolder && <span className="error-text">{errors.cardHolder}</span>}
                        </div>

                        {/* Expiry & CVV */}
                        <div className="form-row">
                            <div className="form-group">
                                <label>Expiry Date</label>
                                <div className={`input-wrapper ${errors.expiryDate ? 'error' : ''}`}>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                        maxLength={5}
                                        disabled={disabled}
                                    />
                                </div>
                                {errors.expiryDate && <span className="error-text">{errors.expiryDate}</span>}
                            </div>
                            <div className="form-group">
                                <label>CVV</label>
                                <div className={`input-wrapper ${errors.cvv ? 'error' : ''}`}>
                                    <FiLock className="input-icon" />
                                    <input
                                        type="password"
                                        placeholder="•••"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                        maxLength={4}
                                        disabled={disabled}
                                    />
                                </div>
                                {errors.cvv && <span className="error-text">{errors.cvv}</span>}
                            </div>
                        </div>

                        {/* Pay Button */}
                        <button
                            className="pay-button"
                            onClick={processPayment}
                            disabled={disabled}
                        >
                            <FiLock />
                            Pay ${amount.toFixed(2)}
                        </button>

                        {/* Security Note */}
                        <div className="security-note">
                            <FiLock />
                            <span>Your payment info is secure. This is a demo - no real charges.</span>
                        </div>

                        {/* Test Cards Reference */}
                        <div className="test-cards-info">
                            <h4>Test Cards</h4>
                            <div className="test-card-list">
                                <div className="test-card-item success">
                                    <span className="icon"><FiCheck /></span>
                                    <code>4242 4242 4242 4242</code>
                                    <span>Success</span>
                                </div>
                                <div className="test-card-item success">
                                    <span className="icon"><FiCheck /></span>
                                    <code>5555 5555 5555 4444</code>
                                    <span>Success (MC)</span>
                                </div>
                                <div className="test-card-item error">
                                    <span className="icon"><FiX /></span>
                                    <code>4000 0000 0000 0002</code>
                                    <span>Decline</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'processing' && (
                    <motion.div
                        key="processing"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="payment-processing"
                    >
                        <div className="processing-animation">
                            <div className="spinner"></div>
                            <div className="pulse-ring"></div>
                        </div>
                        <h3>Processing Payment</h3>
                        <p className="processing-amount">${amount.toFixed(2)}</p>
                        <div className="processing-steps">
                            {processingSteps.map((stepText, index) => (
                                <motion.div
                                    key={index}
                                    className={`processing-step ${index <= processingStep ? 'active' : ''} ${index < processingStep ? 'completed' : ''}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <span className="step-indicator">
                                        {index < processingStep ? <FiCheck /> : index === processingStep ? <span className="dot-pulse"></span> : null}
                                    </span>
                                    <span>{stepText}</span>
                                </motion.div>
                            ))}
                        </div>
                        <p className="processing-note">Please do not close this window...</p>
                    </motion.div>
                )}

                {step === 'success' && (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="payment-success"
                    >
                        <motion.div
                            className="success-icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        >
                            <FiCheck />
                        </motion.div>
                        <h3>Payment Successful!</h3>
                        <p className="success-amount">${amount.toFixed(2)}</p>
                        <p>Your order is being processed...</p>
                    </motion.div>
                )}

                {step === 'error' && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="payment-error"
                    >
                        <motion.div
                            className="error-icon"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                        >
                            <FiX />
                        </motion.div>
                        <h3>Payment Failed</h3>
                        <p className="error-message">{errorMessage}</p>
                        <button className="retry-button" onClick={handleRetry}>
                            Try Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PaymentForm;
