import styled from 'styled-components';

const StyledNavLink = styled.a<{ isActive: boolean }>`
  border-bottom: ${(props) => (props.isActive ? '2px solid var(--primary-color)' : '')};
  color: ${(props) => (props.isActive ? 'var(--primary-color)' : '')};
`;

export function DesktopNavLink({ label, isActive = false }: { label: string; isActive?: boolean }) {
  return (
    <StyledNavLink
      href="#"
      isActive={isActive}
      className={
        isActive
          ? 'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium text-gray-900'
          : 'inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700'
      }
    >
      {label}
    </StyledNavLink>
  );
}