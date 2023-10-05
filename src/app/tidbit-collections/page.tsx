'use client';

import ViewByteModal from '@/app/tidbit-collections/ViewByteModal';
import withSpace, { SpaceProps } from '@/app/withSpace';
import Block from '@/components/app/Block';
import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard';
import NoByteCollections from '@/components/byteCollection/ByteCollections/NoByteCollections';
import { Grid2Cols } from '@/components/core/grids/Grid2Cols';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import { useByteCollectionsQuery } from '@/graphql/generated/generated-types';
import React from 'react';

function ByteCollections({ space }: SpaceProps) {
  const { data, error, loading, refetch: fetchSimulations } = useByteCollectionsQuery({ variables: { spaceId: space.id } });

  const loadingData = loading || !space;

  const [selectedByteId, setSelectedByteId] = React.useState<string | null>(null);

  const onSelectByte = (byteId: string) => {
    setSelectedByteId(byteId);
  };
  return (
    <PageWrapper>
      {!data?.byteCollections.length && !loadingData && <NoByteCollections space={space} />}
      {!!data?.byteCollections?.length && (
        <Grid2Cols>
          {data?.byteCollections?.map((byteCollection, i) => (
            <ByteCollectionsCard key={i} byteCollection={byteCollection} onSelectByte={onSelectByte} />
          ))}
        </Grid2Cols>
      )}
      <div style={{ height: '10px', width: '10px', position: 'absolute' }} />
      {loadingData && (
        <Block slim={true}>
          <RowLoading className="my-2" />
        </Block>
      )}

      {selectedByteId && <ViewByteModal showByteModal={!!selectedByteId} onClose={() => setSelectedByteId(null)} space={space} byteId={selectedByteId} />}
    </PageWrapper>
  );
}

export default withSpace(ByteCollections);