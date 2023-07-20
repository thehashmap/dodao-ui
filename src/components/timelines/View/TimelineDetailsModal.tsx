import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { TimelineEventFragment } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import React from 'react';
import styled from 'styled-components';

const LargeTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
`;
const ModalContent = styled.div`
  max-width: 500px; /* Adjust the max-width as needed */
  margin: 0 auto;
`;

const CloseButton = styled.button`
  transition: all 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

export interface TimelineDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event: TimelineEventFragment;
}
export default function TimelineDetailsModal({ event, open, onClose }: TimelineDetailsModalProps) {
  const fullDetails = event.fullDetails;
  if (!fullDetails) return null;

  const renderer = getMarkedRenderer();
  const eventDetails = marked.parse(fullDetails, { renderer });
  return (
    <FullScreenModal open={open} onClose={onClose} title={<LargeTitle>{event.title} Details</LargeTitle>}>
      <div className="markdown-body  text-sm text-left" dangerouslySetInnerHTML={{ __html: eventDetails }} />
    </FullScreenModal>
  );
}
