import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { motion } from 'framer-motion';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    success?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    helperText?: string;
}

export const Input = ({
    label,
    error,
    success,
    leftIcon,
    rightIcon,
    helperText,
    className = '',
    ...props
}: InputProps) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = props.value !== undefined && props.value !== '';

    const wrapperClassNames = [
        'input-wrapper',
        error && 'input-error',
        success && 'input-success',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={wrapperClassNames}>
            <div className="input-container">
                {leftIcon && <span className="input-icon input-icon-left">{leftIcon}</span>}

                <input
                    className={`input ${leftIcon ? 'has-left-icon' : ''} ${rightIcon ? 'has-right-icon' : ''}`}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {label && (
                    <motion.label
                        className="input-label"
                        animate={{
                            top: isFocused || hasValue ? '0.25rem' : '50%',
                            fontSize: isFocused || hasValue ? '0.75rem' : '1rem',
                            color: error
                                ? 'var(--error)'
                                : isFocused
                                    ? 'var(--primary)'
                                    : 'var(--text-tertiary)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        {label}
                    </motion.label>
                )}

                {rightIcon && <span className="input-icon input-icon-right">{rightIcon}</span>}
            </div>

            {error && (
                <motion.p
                    className="input-message error-message"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {error}
                </motion.p>
            )}

            {helperText && !error && (
                <p className="input-message helper-text">{helperText}</p>
            )}
        </div>
    );
};
