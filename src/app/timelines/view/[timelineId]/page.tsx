'use client';

import withSpace from '@/app/withSpace';
import Block from '@/components/app/Block';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import RowLoading from '@/components/core/loaders/RowLoading';
import PageWrapper from '@/components/core/page/PageWrapper';
import TimelineDetails from '@/components/timelines/View/TimelineDetails';
import { SpaceWithIntegrationsFragment, useTimelineDetailsQuery } from '@/graphql/generated/generated-types';
import { getMarkedRenderer } from '@/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const TimelinePage = ({ params, space }: { params: { timelineId: string }; space: SpaceWithIntegrationsFragment }) => {
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  const router = useRouter();
  const { data, loading } = useTimelineDetailsQuery({ variables: { timelineId: params.timelineId, spaceId: space.id } });
  const renderer = getMarkedRenderer();
  const contents = data?.timeline?.content && marked.parse(data?.timeline?.content, { renderer });
  return (
    <PageWrapper>
      <div className="pt-12">
        <div className="lg:px-6 py-4">
          {data?.timeline && !loading ? (
            <>
              <div className="px-4 md:px-0 mb-5 flex justify-between">
                <Link href="/timelines" className="text-color">
                  <span className="mr-1 font-bold">&#8592;</span>
                  All Timelines
                </Link>
                <div className="ml-3">
                  <PrivateEllipsisDropdown
                    items={threeDotItems}
                    onSelect={(key) => {
                      router.push(`/timelines/edit/${params.timelineId}`);
                    }}
                  />
                </div>
              </div>
              <div className="mb-8 px-2 text-2xl">
                <div className="mt-2">
                  <h1 className="mb-2 px-2 text-3xl font-semibold ">{data?.timeline?.name}</h1>
                </div>
                <div className="px-2 text-base">{data?.timeline?.excerpt}</div>
                <div className="px-2 mt-2 text-sm " dangerouslySetInnerHTML={{ __html: contents || '' }}></div>
              </div>
              <div className="px-2">{!loading && <TimelineDetails timeline={data?.timeline} space={space} />}</div>
            </>
          ) : (
            <Block slim>
              <RowLoading className="my-2" />
            </Block>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default withSpace(TimelinePage);
