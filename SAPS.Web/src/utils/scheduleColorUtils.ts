import { ParkingFeeSchedule } from '@/services/parkinglot/parkinglotFeeService';

// Shared color palette for parking fee schedules
export const SCHEDULE_COLORS = [
    'bg-[#C6D9F1] text-[#030452]',      // Muted theme
    'bg-[#aee7ff] text-[#0061ff]',     // Primary 200 bg / Primary 700 text
    'bg-[#f1faee] text-[#457b9d]',     // Info theme
    'bg-[#dad7cd] text-[#606c38]',     // Success theme
    'bg-[#fdf0d5] text-[#c1121f]',     // Warning theme
    'bg-[#d1f1ff] text-[#0050d7]',     // Primary theme - light blue
    'bg-[#e8d5c4] text-[#8b4513]',     // Brown theme
    'bg-[#d4edda] text-[#155724]',     // Green theme
    'bg-[#f8d7da] text-[#721c24]',     // Red theme
    'bg-[#fff3cd] text-[#856404]',     // Yellow theme
    'bg-[#d1ecf1] text-[#0c5460]',     // Cyan theme
];

/**
 * Generates a consistent color for a parking fee schedule based on its ID
 * This ensures the same schedule always gets the same color across different components
 */
export const getScheduleColor = (schedule: ParkingFeeSchedule): string => {
    if (!schedule.isActive) {
        return 'bg-gray-100 border-gray-300 text-gray-500';
    }

    // Handle cases where schedule.id might be undefined or null
    if (!schedule.id) {
        return SCHEDULE_COLORS[0]; // Return first color as fallback
    }

    // Use schedule ID to generate consistent color
    // Convert string ID to number for consistent hashing
    let hash = 0;

    for (let i = 0; i < schedule.id.length; i++) {
        const char = schedule.id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get color index
    const colorIndex = Math.abs(hash) % SCHEDULE_COLORS.length;
    return SCHEDULE_COLORS[colorIndex];
    
};

/**
 * Alternative function that uses schedule name for color assignment
 * Useful when you want colors based on schedule names instead of IDs
 */
export const getScheduleColorByName = (schedule: ParkingFeeSchedule): string => {
    if (!schedule.isActive) {
        return 'bg-gray-100 border-gray-300 text-gray-500';
    }

    // Use schedule name to generate consistent color
    let hash = 0;
    for (let i = 0; i < schedule.name.length; i++) {
        const char = schedule.name.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    const colorIndex = Math.abs(hash) % SCHEDULE_COLORS.length;
    return SCHEDULE_COLORS[colorIndex];
};

// Style objects for inline styles
export const SCHEDULE_STYLES = [
    { backgroundColor: '#C6D9F1', color: '#030452' },      // Muted theme
    { backgroundColor: '#aee7ff', color: '#0061ff' },     // Primary 200 bg / Primary 700 text
    { backgroundColor: '#f1faee', color: '#457b9d' },     // Info theme
    { backgroundColor: '#dad7cd', color: '#606c38' },     // Success theme
    { backgroundColor: '#fdf0d5', color: '#c1121f' },     // Warning theme
    { backgroundColor: '#d1f1ff', color: '#0050d7' },     // Primary theme - light blue
    { backgroundColor: '#e8d5c4', color: '#8b4513' },     // Brown theme
    { backgroundColor: '#d4edda', color: '#155724' },     // Green theme
    { backgroundColor: '#f8d7da', color: '#721c24' },     // Red theme
    { backgroundColor: '#fff3cd', color: '#856404' },     // Yellow theme
    { backgroundColor: '#d1ecf1', color: '#0c5460' },     // Cyan theme
];

/**
 * Returns style object for inline styles instead of CSS classes
 */
export const getScheduleStyle = (schedule: ParkingFeeSchedule): React.CSSProperties => {
    if (!schedule.isActive) {
        return { backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#d1d5db' };
    }

    // Handle cases where schedule.id might be undefined or null
    if (!schedule.id) {
        return SCHEDULE_STYLES[0]; // Return first color as fallback
    }

    // Use schedule ID to generate consistent color
    let hash = 0;
    for (let i = 0; i < schedule.id.length; i++) {
        const char = schedule.id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use absolute value and modulo to get color index
    const colorIndex = Math.abs(hash) % SCHEDULE_STYLES.length;
    return SCHEDULE_STYLES[colorIndex];
}; 