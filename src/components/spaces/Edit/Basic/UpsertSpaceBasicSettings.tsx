import UploadInput from '@/components/app/UploadInput';
import UpsertBadgeInput from '@/components/core/badge/UpsertBadgeInput';
import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import StyledSelect from '@/components/core/select/StyledSelect';
import { UseEditSpaceHelper } from '@/components/spaces/Edit/Basic/useEditSpace';
import { Themes } from '@/types/deprecated/models/enums';
import { slugify } from '@/utils/auth/slugify';
import { themeSelect } from '@/utils/ui/statuses';
import union from 'lodash/union';
import React, { useState } from 'react';

export default function UpsertSpaceBasicSettings(props: { editSpaceHelper: UseEditSpaceHelper }) {
  const [uploadThumbnailLoading, setUploadThumbnailLoading] = useState(false);

  const { space, setSpaceField, setSpaceIntegrationField, upsertSpace, upserting } = props.editSpaceHelper;

  function inputError(avatar: string) {
    return null;
  }

  return (
    <>
      <div className="space-y-12">
        <div className="border-b pb-12">
          <h2 className="text-base font-semibold leading-7">Edit Space</h2>
          <p className="mt-1 text-sm leading-6">Update the details of Space</p>

          <Input label="Id" modelValue={space?.id} onUpdate={(value) => setSpaceField('id', value?.toString() || '')} />
          <Input label="Name" modelValue={space?.name} onUpdate={(value) => setSpaceField('name', value?.toString() || '')} />
          <UploadInput
            error={inputError('avatar')}
            onUpdate={(newValue) => setSpaceField('avatar', newValue)}
            imageType="AcademyLogo"
            spaceId={space?.id || 'new-space'}
            modelValue={space?.avatar}
            objectId={(space?.name && slugify(space?.name)) || space?.id || 'new-space'}
            onInput={(value) => setSpaceField('avatar', value)}
            onLoading={setUploadThumbnailLoading}
          />
          <Input
            label="Academy Repo"
            modelValue={space?.spaceIntegrations?.academyRepository}
            placeholder={'https://github.com/DoDAO-io/dodao-academy'}
            onUpdate={(value) => setSpaceIntegrationField('academyRepository', value?.toString() || '')}
          />
          <StyledSelect
            label="Theme"
            selectedItemId={Object.keys(Themes).includes(space?.skin || '') ? space.skin : Themes.DoDAO}
            items={themeSelect}
            setSelectedItemId={(value) => setSpaceField('skin', value)}
          />
          <UpsertBadgeInput
            label={'Domains'}
            badges={space.domains.map((d) => ({ id: d, label: d }))}
            onAdd={(d) => {
              setSpaceField('domains', union(space.domains, [d]));
            }}
            onRemove={(d) => {
              setSpaceField(
                'domains',
                space.domains.filter((domain) => domain !== d)
              );
            }}
          />
          <UpsertBadgeInput
            label={'Admins By Usernames'}
            badges={space.adminUsernames.map((d) => ({ id: d, label: d }))}
            onAdd={(admin) => {
              setSpaceField('adminUsernames', union(space.adminUsernames, [admin]));
            }}
            onRemove={(d) => {
              setSpaceField(
                'adminUsernames',
                space.adminUsernames.filter((domain) => domain !== d)
              );
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <Button variant="outlined">Cancel</Button>
        <Button variant="contained" primary loading={upserting} disabled={uploadThumbnailLoading || upserting} onClick={() => upsertSpace()}>
          Save
        </Button>
      </div>
    </>
  );
}
