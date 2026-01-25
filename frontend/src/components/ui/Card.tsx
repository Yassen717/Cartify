import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import './Card.css';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
    variant?: 'default' | 'glass' | 'gradient' | 'outlined' | 'elevated';
    hover?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    children: ReactNode;
}

export const Card = ({
    variant = 'default',
    hover = false,
    padding = 'md',
    children,
    className = '',
    ...props
}: CardProps) => {
    const classNames = [
        'card',
        `card-${variant}`,
        `card-padding-${padding}`,
        hover && 'card-hover',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <motion.div
            className={classNames}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={hover ? { y: -4, boxShadow: 'var(--shadow-xl)' } : {}}
            {...props}
        >
            {children}
        </motion.div>
    );
};
