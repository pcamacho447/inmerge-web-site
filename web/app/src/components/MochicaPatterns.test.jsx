import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  MochicaDivider,
  MochicaCornerFrame,
  MochicaWatermark,
  MochicaStepIcon,
  MochicaSteppedWall,
  MochicaSteppedRiser,
  MochicaPodiumBase,
  renderSteppedSegment,
  renderGrecaSegment,
  renderWaveSegment,
  renderDentatedSegment,
  renderRhombusSegment,
  renderVoluteSegment,
} from './MochicaPatterns.jsx';

describe('MochicaPatterns Component Suite', () => {
  it('renders individual pattern segments correctly without errors', () => {
    const { container: stepped } = render(<svg>{renderSteppedSegment(0, 0, 40, 16, '#A8472B')}</svg>);
    expect(stepped.querySelector('path')).toBeInTheDocument();

    const { container: greca } = render(<svg>{renderGrecaSegment(0, 0, 40, 16, '#D8A84E')}</svg>);
    expect(greca.querySelector('path')).toBeInTheDocument();

    const { container: wave } = render(<svg>{renderWaveSegment(0, 0, 40, 16, '#C68A3D')}</svg>);
    expect(wave.querySelector('path')).toBeInTheDocument();

    const { container: dentated } = render(<svg>{renderDentatedSegment(0, 0, 40, 16, '#241A12')}</svg>);
    expect(dentated.querySelector('path')).toBeInTheDocument();

    const { container: rhombus } = render(<svg>{renderRhombusSegment(0, 0, 40, 16, '#A8472B')}</svg>);
    expect(rhombus.querySelector('path')).toBeInTheDocument();
    expect(rhombus.querySelector('rect')).toBeInTheDocument();

    const { container: volute } = render(<svg>{renderVoluteSegment(0, 0, 40, 16, '#D8A84E')}</svg>);
    expect(volute.querySelector('path')).toBeInTheDocument();
  });

  it('renders procedural MochicaDivider with SVG and aria-hidden', () => {
    const { container } = render(<MochicaDivider color="var(--terracotta)" height={20} seed="test-seed-1" showBaseline={true} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders MochicaCornerFrame around child element with 4 corner SVG brackets', () => {
    const { container, getByText } = render(
      <MochicaCornerFrame color="var(--gold)" variant="stepped">
        <div data-testid="content-box">Audit Box Content</div>
      </MochicaCornerFrame>,
    );

    expect(getByText('Audit Box Content')).toBeInTheDocument();
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBe(4);
  });

  it('renders MochicaWatermark with geometric shapes', () => {
    const { container: pyramid } = render(<MochicaWatermark variant="stepped-pyramid" color="var(--gold)" />);
    expect(pyramid.querySelector('svg')).toBeInTheDocument();

    const { container: medallion } = render(<MochicaWatermark variant="rhombus-medallion" color="var(--terracotta)" />);
    expect(medallion.querySelector('svg')).toBeInTheDocument();
  });

  it('renders MochicaStepIcon across tiers 1, 2, and 3', () => {
    const { container: t1 } = render(<MochicaStepIcon level={1} color="var(--terracotta)" />);
    expect(t1.querySelector('svg')).toBeInTheDocument();

    const { container: t2 } = render(<MochicaStepIcon level={2} color="var(--ochre)" />);
    expect(t2.querySelector('svg')).toBeInTheDocument();

    const { container: t3 } = render(<MochicaStepIcon level={3} color="var(--gold)" />);
    expect(t3.querySelector('svg')).toBeInTheDocument();
    expect(t3.querySelector('rect')).toBeInTheDocument(); // Apex rhombus
  });

  it('renders MochicaSteppedWall backdrop SVG with stepped profile', () => {
    const { container } = render(<MochicaSteppedWall color="var(--border)" accentColor="var(--gold)" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders MochicaSteppedRiser with stepped vertical riser SVG', () => {
    const { container } = render(<MochicaSteppedRiser height={48} color="var(--border)" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders MochicaPodiumBase as clean grounding foundation plinth', () => {
    const { container } = render(<MochicaPodiumBase color="var(--border)" height={18} />);
    expect(container.querySelector('.mochica-podium-base')).toBeInTheDocument();
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
