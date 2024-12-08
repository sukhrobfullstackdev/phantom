import styled from '@emotion/styled';
import { Button, ButtonSize } from '~/features/connect-with-ui/components/button';

export const IMAGE_MARGIN = 8;
export const IMAGE_WIDTH = 96;

export const CarouselContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

export const NftCarousel = styled.div`
  flex: 1;
  overflow: hidden;
  position: relative;
  overflow-x: hidden;
`;

export const CarouselImages = styled.div`
  display: flex;
  transition: transform 0.3s ease;
  margin-top: ${IMAGE_MARGIN}px;
  margin-bottom: ${IMAGE_MARGIN}px;
`;

export const CarouselImage = styled.img`
  width: 100%;
  object-fit: cover;
  height: ${IMAGE_WIDTH}px;
  aspect-ratio: 1 / 1;
  margin-right: ${IMAGE_MARGIN}px;
  border-radius: 16px;
  box-shadow: 0px 4px 4px 1px rgba(0, 0, 0, 0.18);
  cursor: pointer;
`;

export const Arrow = styled(Button)`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0px;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--silk10);
  border-radius: 50%;
`;

export const CarouselHeader = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const ArrowContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
`;
