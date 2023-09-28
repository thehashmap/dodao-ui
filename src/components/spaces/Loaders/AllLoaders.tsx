import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { Table, TableActions, TableRow } from '@/components/core/table/Table';
import UpsertArticleIndexingInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertArticleIndexingInfoModal';
import UpsertWebsiteScrapingInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertWebsiteScrapingInfoModal';
import DiscordChannels from '@/components/spaces/Loaders/Discord/DiscordChannels';
import DiscordMessages from '@/components/spaces/Loaders/Discord/DiscordMessages';
import DiscourseIndexRuns from '@/components/spaces/Loaders/Discourse/DiscourseIndexRuns';
import DiscoursePostComments from '@/components/spaces/Loaders/Discourse/DiscoursePostComments';
import WebsiteScrapedURLInfosTable from '@/components/spaces/Loaders/WebsiteScrape/WebsiteScrapedURLInfosTable';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ArticleIndexingInfoFragment,
  SpaceWithIntegrationsFragment,
  useArticleIndexingInfosQuery,
  useTriggerSiteScrapingRunMutation,
  useWebsiteScrapingInfosQuery,
  WebsiteScrapingInfoFragment,
} from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

export enum LoaderType {
  Discourse = 'discourse',
  Discord = 'discord',
  WebsiteScraping = 'website-scraping',
}

export enum LoaderSubView {
  DiscourseIndexRuns = 'discourse-index-runs',
  DiscoursePostComments = 'post-comments',
  DiscordChannels = 'channels',
  DiscordMessages = 'messages',

  WebsiteScrapingURLInfos = 'website-scraping-url-infos',
}
function getLoaderRows(): TableRow[] {
  const indexedAt = moment(new Date()).local().format('YYYY/MM/DD HH:mm');
  const tableRows: TableRow[] = [];
  tableRows.push({
    id: 'discourse',
    columns: ['Discourse', indexedAt, 'STATUS'],
    item: {
      id: 'discourse',
    },
  });

  tableRows.push({
    id: 'discord',
    columns: ['Discord', indexedAt, 'STATUS'],
    item: {
      id: 'discord',
    },
  });
  return tableRows;
}

export default function AllLoaders(props: { space: SpaceWithIntegrationsFragment; spaceInfoParams: string[] }) {
  const router = useRouter();

  const websiteScrappingThreeDotItems = [{ label: 'Add', key: 'add' }];

  const [showAddWebsiteScrappingInfoModal, setShowAddWebsiteScrappingInfoModal] = useState(false);
  const [editWebsiteScrappingInfo, setEditWebsiteScrappingInfo] = useState<WebsiteScrapingInfoFragment | undefined>(undefined);

  const [editArticleIndexingInfo, setEditArticleIndexingInfo] = useState<ArticleIndexingInfoFragment | undefined>(undefined);
  const [showAddArticleIndexingInfoModal, setShowAddArticleIndexingInfoModal] = useState(false);

  const { showNotification } = useNotificationContext();
  const { data: websiteInfos } = useWebsiteScrapingInfosQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const { data: articleIndexingInfos } = useArticleIndexingInfosQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const [triggerSiteScrapingRunMutation] = useTriggerSiteScrapingRunMutation();

  const siteScrapingActionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View',
    },
    {
      key: 'edit',
      label: 'Edit',
    },
    {
      key: 'index',
      label: 'Index',
    },
  ];

  function getWebsiteScrapingInfoTable(discoursePosts: WebsiteScrapingInfoFragment[]): TableRow[] {
    return discoursePosts.map((post: WebsiteScrapingInfoFragment): TableRow => {
      return {
        id: post.id,
        columns: [post.id.substring(0, 6), post.host, post.scrapingStartUrl, post.ignoreHashInUrl.toString(), post.ignoreQueryParams.toString()],
        item: post,
      };
    });
  }

  function getArticleIndexingInfoTable(discoursePosts: ArticleIndexingInfoFragment[]): TableRow[] {
    return discoursePosts.map((post: ArticleIndexingInfoFragment): TableRow => {
      return {
        id: post.id,
        columns: [post.id.substring(0, 6), post.articleUrl, post.text, post.textLength, post.status],
        item: post,
      };
    });
  }

  const loaderType = props.spaceInfoParams?.[2];
  const loaderSubview = props.spaceInfoParams?.[3];
  const subviewPathParam = props.spaceInfoParams?.[4];

  const tableActions: TableActions = useMemo(() => {
    return {
      items: [
        {
          key: 'view',
          label: 'View',
        },
      ],
      onSelect: async (key: string, item: { id: string }) => {
        if (key === 'view') {
          if (item.id === 'discourse') {
            router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discourse/discourse-index-runs');
            return;
          }

          const discordServerId = props.space.spaceIntegrations?.loadersInfo?.discordServerId;
          console.log('discordServerId', discordServerId);
          if (item.id === 'discord' && discordServerId) {
            router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discord/channels');
            return;
          }
        }
      },
    };
  }, []);

  if (loaderSubview === LoaderSubView.DiscourseIndexRuns) {
    return <DiscourseIndexRuns space={props.space} />;
  }

  if (loaderSubview === LoaderSubView.DiscoursePostComments && subviewPathParam) {
    return <DiscoursePostComments space={props.space} postId={subviewPathParam} />;
  }

  if (loaderSubview === LoaderSubView.DiscordChannels) {
    return <DiscordChannels space={props.space} />;
  }

  if (loaderSubview === LoaderSubView.DiscordMessages && subviewPathParam) {
    return <DiscordMessages space={props.space} channelId={subviewPathParam} />;
  }

  if (loaderSubview === LoaderSubView.WebsiteScrapingURLInfos && subviewPathParam) {
    return <WebsiteScrapedURLInfosTable space={props.space} websiteScrapingInfoId={subviewPathParam} />;
  }
  return (
    <div className="mx-8 mt-8">
      <div className="flex justify-between">
        <div className="text-xl">Loaders</div>
      </div>
      <Table data={getLoaderRows()} columnsHeadings={['Loader', 'Last Indexed At', 'Status']} columnsWidthPercents={[20, 50, 20, 10]} actions={tableActions} />

      <div className="mt-16">
        <div className="flex justify-between">
          <div className="text-xl">Website Scraping Infos</div>
          <PrivateEllipsisDropdown items={websiteScrappingThreeDotItems} onSelect={() => setShowAddWebsiteScrappingInfoModal(true)} />
        </div>
        <Table
          data={getWebsiteScrapingInfoTable(websiteInfos?.websiteScrapingInfos || [])}
          columnsHeadings={['Id', 'Host', 'Scraping Start Url', 'Ignore Hash', 'Ignore Query']}
          columnsWidthPercents={[5, 25, 20, 20, 10, 10]}
          actions={{
            items: siteScrapingActionItems,
            onSelect: async (key: string, item: { id: string }) => {
              if (key === 'view') {
                router.push('/space/manage/' + ManageSpaceSubviews.Loaders + '/discourse/website-scraping-url-infos/' + item.id);
              } else if (key === 'edit') {
                setEditWebsiteScrappingInfo(item as WebsiteScrapingInfoFragment);
                setShowAddWebsiteScrappingInfoModal(true);
              } else if (key === 'index') {
                await triggerSiteScrapingRunMutation({
                  variables: {
                    spaceId: props.space.id,
                    websiteScrapingInfoId: item.id,
                  },
                });
                showNotification({ message: 'Triggered Indexing of the site', type: 'success' });
              }
            },
          }}
        />
      </div>

      <div className="mt-16">
        <div className="flex justify-between">
          <div className="text-xl">Articles Indexed</div>
          <PrivateEllipsisDropdown items={websiteScrappingThreeDotItems} onSelect={() => setShowAddArticleIndexingInfoModal(true)} />
        </div>
        <Table
          data={getArticleIndexingInfoTable(articleIndexingInfos?.articleIndexingInfos || [])}
          columnsHeadings={['Id', 'Url', 'Text', 'Text Length', 'Status']}
          columnsWidthPercents={[5, 25, 20, 20, 20]}
          actions={{
            items: [
              {
                key: 'edit',
                label: 'Edit',
              },
            ],
            onSelect: async (key: string, item: { id: string }) => {
              if (key === 'edit') {
                setEditArticleIndexingInfo(item as ArticleIndexingInfoFragment);
                setShowAddArticleIndexingInfoModal(true);
              }
            },
          }}
        />
      </div>
      {showAddWebsiteScrappingInfoModal && (
        <UpsertWebsiteScrapingInfoModal
          websiteScrapingInfo={editWebsiteScrappingInfo}
          open={showAddWebsiteScrappingInfoModal}
          onClose={() => {
            setEditWebsiteScrappingInfo(undefined);
            setShowAddWebsiteScrappingInfoModal(false);
          }}
          spaceId={props.space.id}
        />
      )}
      {showAddArticleIndexingInfoModal && (
        <UpsertArticleIndexingInfoModal
          articleIndexingInfo={editArticleIndexingInfo}
          open={showAddArticleIndexingInfoModal}
          onClose={() => {
            setEditArticleIndexingInfo(undefined);
            setShowAddArticleIndexingInfoModal(false);
          }}
          spaceId={props.space.id}
        />
      )}
    </div>
  );
}
