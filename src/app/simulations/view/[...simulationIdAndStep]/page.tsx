'use client';

import withSpace from '@/app/withSpace';
import EllipsisDropdown from '@/components/core/dropdowns/EllipsisDropdown';
import SimulationViewStepper from '@/components/simulation/View/SimulationStepper';
import { useViewSimulation } from '@/components/simulation/View/useViewSimulation';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const SimulationCardWrapper = styled.div`
  width: 100%;
  max-width: 1440px;
  padding: 24px;

  @media screen and (min-width: 767px) {
    height: calc(100vh - 200px);
  }
`;

function ViewSimulation({ params, space }: { params: { simulationIdAndStep: string[] }; space: SpaceWithIntegrationsFragment }) {
  const { simulationIdAndStep } = params;

  const simulationId = Array.isArray(simulationIdAndStep) ? simulationIdAndStep[0] : (simulationIdAndStep as string);

  let stepOrder = 0;
  if (Array.isArray(simulationIdAndStep)) {
    stepOrder = parseInt(simulationIdAndStep[1]);
  }

  const viewSimulationHelper = useViewSimulation(space, simulationId, stepOrder);

  const { simulationRef: simulation, simulationLoaded } = viewSimulationHelper;

  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  useEffect(() => {
    viewSimulationHelper.initialize();
  }, [simulationId]);

  const router = useRouter();

  return (
    <div
      className="section mt-16 flex-auto"
      style={{
        boxSizing: 'border-box',
        position: 'absolute',
        left: 0,
        right: 0,
        height: '100%',
      }}
    >
      <Container>
        <SimulationCardWrapper>
          {simulation && (
            <div className="px-4 md:px-0 mb-3 flex justify-between">
              <Link href="/simulations" className="text-color">
                <span className="mr-1 font-bold">&#8592;</span>
                All Simulations
              </Link>
              <div className="ml-3">
                <EllipsisDropdown
                  items={threeDotItems}
                  onSelect={(key) => {
                    router.push(`/simulations/edit/${simulationId}`);
                  }}
                />
              </div>
              <SimulationViewStepper viewSimulationHelper={viewSimulationHelper} simulation={simulation} />
            </div>
          )}
        </SimulationCardWrapper>
      </Container>
    </div>
  );
}

export default withSpace(ViewSimulation);
