interface ButterflyIconProps {
    size?: number;
    color?: string;
    background?: string;
}

export const ButterflyIcon: React.FC<ButterflyIconProps> = ({ 
    size = 24, 
    color = 'white',
    background = '#000000'
}) => {
    return (
            <svg width={size} height={size} viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill={background}/>
            <g fill={color}>
                <path d="M12 12 Q8 6 5 7 Q3 8 5 12 Q8 10 12 12"/>
                <path d="M12 12 Q16 6 19 7 Q21 8 19 12 Q16 10 12 12"/>
                <path d="M12 12 Q8 14 5 17 Q3 16 5 12 Q8 14 12 12"/>
                <path d="M12 12 Q16 14 19 17 Q21 16 19 12 Q16 14 12 12"/>
                <ellipse cx="12" cy="12" rx="0.8" ry="4"/>
                <circle cx="10.5" cy="9" r="0.8"/>
                <circle cx="13.5" cy="9" r="0.8"/>
            </g>
            </svg>
        );
};