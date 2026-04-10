import React from 'react';
import { useSettingsStore } from '@/features/menu/store/settingsStore';
import FloatingBubblesShader from '@/shared/components/ui/FloatingBubblesShader';
import GradientShaderBackground from '@/shared/components/ui/GradientShaderBackground';
import { FloatingBubblesBackground } from '@/shared/components/ui/FloatingBubblesBackground';

/**
 * Animated background wrapper that reads user preference from settingsStore.
 * Renders the selected background type, or nothing if disabled.
 */
const AnimatedBackground: React.FC = () => {
    const enabled = useSettingsStore(s => s.animatedBgEnabled);
    const bgType = useSettingsStore(s => s.animatedBgType);

    if (!enabled) {
        return null;
    }

    switch (bgType) {
        case 'gradient-shader':
            return <GradientShaderBackground />;
        case 'bubbles-classic':
            return <FloatingBubblesBackground />;
        case 'bubbles-shader':
        default:
            return <FloatingBubblesShader />;
    }
};

export default React.memo(AnimatedBackground);
