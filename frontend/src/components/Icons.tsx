import {
    ShieldCheck,
    MessageSquare,
    Settings,
    Maximize2,
    Users
} from 'lucide-react';

interface IconProps {
    className?: string;
    size?: number | string;
}

export const IconShield = ({ className, size }: IconProps) => <ShieldCheck className={className} size={size} />;
export const IconChat = ({ className, size }: IconProps) => <MessageSquare className={className} size={size} />;
export const IconSettings = ({ className, size }: IconProps) => <Settings className={className} size={size} />;
export const IconExpand = ({ className, size }: IconProps) => <Maximize2 className={className} size={size} />;
export const IconUsers = ({ className, size }: IconProps) => <Users className={className} size={size} />;
