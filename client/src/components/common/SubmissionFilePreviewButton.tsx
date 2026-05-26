import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Material } from '../../models/ICourseDetail';
import { submissionFileToMaterial } from '../../utils/submissionContent';
import { MaterialPreviewModal } from './MaterialPreviewModal';

type RemoteProps = {
  fileUrl: string;
  fileName: string;
  className?: string;
};

type LocalProps = {
  file: File;
  className?: string;
};

type Props = RemoteProps | LocalProps;

function isLocalProps(props: Props): props is LocalProps {
  return 'file' in props;
}

export function SubmissionFilePreviewButton(props: Props) {
  const [open, setOpen] = useState(false);
  const isLocal = isLocalProps(props);

  const material = useMemo<Material>(() => {
    if (isLocalProps(props)) {
      return {
        id: 0,
        type: 'file',
        title: props.file.name,
        file_url: '',
      };
    }
    return submissionFileToMaterial(
      { type: 'file', content: props.fileUrl, label: props.fileName },
      0
    );
  }, [props]);

  return (
    <>
      <button
        type="button"
        className={props.className ?? 'submission-file-preview-btn'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title="Предпросмотр"
      >
        <Icon icon="mdi:eye-outline" aria-hidden />
        <span>Предпросмотр</span>
      </button>
      {open && (
        <MaterialPreviewModal
          material={material}
          localFile={isLocal ? props.file : undefined}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
