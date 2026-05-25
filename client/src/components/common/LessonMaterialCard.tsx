import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { Material } from '../../models/ICourseDetail';
import { getMaterialCardIcon } from '../../utils/materialPreview';
import { MaterialPreviewModal } from './MaterialPreviewModal';
import './LessonMaterialCard.css';

type Props = {
  material: Material;
  className?: string;
};

export const LessonMaterialCard: React.FC<Props> = ({ material, className }) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className ? `material-card ${className}` : 'material-card'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPreviewOpen(true);
        }}
      >
        <Icon icon={getMaterialCardIcon(material)} />
        <span>{material.title}</span>
      </button>
      {previewOpen && (
        <MaterialPreviewModal
          material={material}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
};
