import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import './Button.css';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
    children?: ReactNode;
}

export const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {
    const classNames = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-full',
        isLoading && 'btn-loading',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <motion.button
            className={classNames}
            disabled={disabled || isLoading}
            whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
            whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
            transition={{ duration: 0.15 }}
            {...props}
        >
            {isLoading && (
                <span className="btn-spinner" aria-label="Loading">
                    <svg className="spinner" viewBox="0 0 24 24">
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                </span>
            )}
            {!isLoading && leftIcon && <span className="btn-icon">{leftIcon}</span>}
            <span className="btn-text">{children}</span>
            {!isLoading && rightIcon && <span className="btn-icon">{rightIcon}</span>}
        </motion.button>
    );
};
