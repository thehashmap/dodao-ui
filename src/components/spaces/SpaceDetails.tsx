import PageLoading from '@/components/app/PageLoading';
import DetailsField from '@/components/core/details/DetailsField';
import DetailsHeader from '@/components/core/details/DetailsHeader';
import DetailsSection from '@/components/core/details/DetailsSection';
import { SpaceWithIntegrationsFragment, useExtendedSpaceQuery } from '@/graphql/generated/generated-types';

function getSpaceDetailsFields(space: SpaceWithIntegrationsFragment): Array<{ label: string; value: string }> {
  return [
    {
      label: 'Id',
      value: space.id!,
    },
    {
      label: 'Name',
      value: space.name!,
    },
    {
      label: 'Skin',
      value: space.skin!,
    },
  ];
}
export default function SpaceDetails(props: { spaceId: string }) {
  const { data } = useExtendedSpaceQuery({
    variables: {
      spaceId: props.spaceId,
    },
  });

  return data?.space ? (
    <DetailsSection>
      <DetailsHeader header={'Space Details'} subheader={'Information about your space'} />
      {getSpaceDetailsFields(data.space).map((field) => (
        <DetailsField key={field.label} label={field.label} value={field.value} />
      ))}
    </DetailsSection>
  ) : (
    <PageLoading />
  );
}
