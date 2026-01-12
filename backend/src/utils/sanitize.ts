// Sanitize sensitive data before logging

const SENSITIVE_KEYS = [
    'password',
    'passwordhash',
    'token',
    'refreshtoken',
    'secret',
    'authorization',
    'cookie',
    'creditcard',
    'cvv',
    'ssn',
    'apikey',
    'privatekey',
];

export const sanitizeForLog = (data: any): any => {
    if (!data) return data;
    
    if (typeof data === 'string') {
        return data.length > 100 ? data.substring(0, 100) + '...' : data;
    }
    
    if (typeof data !== 'object') return data;
    
    if (Array.isArray(data)) {
        return data.map(item => sanitizeForLog(item));
    }
    
    const sanitized: any = {};
    
    for (const key in data) {
        const lowerKey = key.toLowerCase();
        const isSensitive = SENSITIVE_KEYS.some(s => lowerKey.includes(s));
        
        if (isSensitive) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            sanitized[key] = sanitizeForLog(data[key]);
        } else {
            sanitized[key] = data[key];
        }
    }
    
    return sanitized;
};
