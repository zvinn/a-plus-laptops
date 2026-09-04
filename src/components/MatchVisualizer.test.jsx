import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MatchVisualizer from './MatchVisualizer';

const mockLanguage = { language: 'en', t: (key) => key };
vi.mock('../context/LanguageContext', () => ({
    useLanguage: () => mockLanguage
}));

describe('MatchVisualizer Component', () => {
    it('should render correct score and reasons', () => {
        const reasons = ['Great Battery', 'Fast CPU'];
        render(<MatchVisualizer score={85} reasons={reasons} />);

        expect(screen.getByText('85%')).toBeInTheDocument();
        expect(screen.getByText('Great Battery')).toBeInTheDocument();
        expect(screen.getByText('Fast CPU')).toBeInTheDocument();
        expect(screen.getByText('Match Score')).toBeInTheDocument();
    });

    it('should show Arabic text when language is ar', () => {
        mockLanguage.language = 'ar';

        const reasons = ['بطارية ممتازة'];
        render(<MatchVisualizer score={95} reasons={reasons} />);

        expect(screen.getByText('نسبة التطابق')).toBeInTheDocument();
        expect(screen.getByText('بطارية ممتازة')).toBeInTheDocument();
    });
});
