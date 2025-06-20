import React from 'react';

interface MasterclassVideoDemoProps {
  src: string;
}

const MasterclassVideoDemo: React.FC<MasterclassVideoDemoProps> = ({ src }) => {
  return (
    <video src={src} controls style={{ width: '100%', borderRadius: 8 }} />
  );
};

export default MasterclassVideoDemo; 