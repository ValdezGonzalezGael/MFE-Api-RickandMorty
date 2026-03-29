import React from "react";

interface ModalCharacterDetailMockProps {
  characterId: number;
  triggerText?: string;
}

const ModalCharacterDetailMock: React.FC<ModalCharacterDetailMockProps> = ({
  characterId,
  triggerText = "Ver detalle",
}) => {
  return (
    <button data-testid={`modal-detail-${characterId}`}>
      {triggerText} - {characterId}
    </button>
  );
};

export default ModalCharacterDetailMock;