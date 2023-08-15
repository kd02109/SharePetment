import { useState } from 'react';
import { useReadLocalStorage } from 'usehooks-ts';
import PetInfoBox from '../petinfo-box/PetInfoBox.tsx';
import { SERVER_URL } from '@/api/url.ts';
import Popup from '@/common/popup/Popup.tsx';
import PetInfo from '@/components/pet/PetInfo.tsx';
import {
  Container,
  DeletePet,
  PetCheckFalse,
  PetCheckTrue,
  SettingPet,
} from '@/components/user_my_page/pet-container/petContainer.styled.tsx';
import useDeleteMutation from '@/hook/api/mutation/useDeleteMutation.tsx';
import usePatchMutation from '@/hook/api/mutation/usePatchMutation.tsx';

interface Prop {
  name: string;
  information: string;
  petId: number;
  sex: string;
  age: number;
  uploadFileURL: string;
  isPetCheck: number | undefined;
  setIsPetCheck: React.Dispatch<React.SetStateAction<number>>;
  index: number;
}
// petCheck 여부 확인하기
export default function PetContainer(prop: Prop) {
  const {
    name,
    information,
    petId,
    sex,
    age,
    uploadFileURL,
    setIsPetCheck,
    isPetCheck,
    index,
  } = prop;

  // 펫 등록 수정 띄위기
  const [isPetOpened, setIsPetOpened] = useState(false);

  // 펫 삭제 확인 팝업 작성
  const [isDeletePopUp, setIsDeletePopUp] = useState(false);
  const accessToken = useReadLocalStorage<string | null>('accessToken');

  // 펫 삭제 오류 팝업
  const [isDelelteError, setIsDeleteError] = useState(false);

  // 펫 수정 오류 팝업
  const [isEditError, setIsEditError] = useState(false);

  // 펫 삭제 로직 작성

  const deletePetMutation = useDeleteMutation({
    keys: [['myPage']],
    successFn: () => setIsDeletePopUp(false),
    errorFn: () => {
      setIsDeletePopUp(false);
      setIsDeleteError(true);
    },
  });

  const handleDeletePet = () => {
    deletePetMutation.mutate({
      url: `${SERVER_URL}/pets/${petId}`,
      accessToken,
    });
  };

  const handleOpenDeletePopup = () => {
    setIsDeletePopUp(true);
  };

  const mutationPatchUserProfile = usePatchMutation({
    key: ['myPage'],
    errorFn: () => setIsEditError(true),
  });

  // 유저 프로필 변경
  const handleChangeUserProfile = (petId: number, index: number) => {
    setIsPetCheck(index);
    mutationPatchUserProfile.mutate({
      url: `${SERVER_URL}/members/image/${petId}`,
      accessToken: accessToken as string,
    });
  };

  // 펫 정보 수정
  const handlePetEditPopUp = () => {
    setIsPetOpened(true);
  };

  return (
    <>
      <Container>
        {isPetCheck !== index && (
          <PetCheckFalse
            onClick={() => handleChangeUserProfile(petId, index)}
          />
        )}
        {isPetCheck === index && (
          <PetCheckTrue onClick={() => handleChangeUserProfile(petId, index)} />
        )}
        <PetInfoBox
          name={name}
          uploadFileURL={uploadFileURL}
          information={information}
          sex={sex}
        />
        <DeletePet onClick={handleOpenDeletePopup} stroke="black" />
        <SettingPet onClick={handlePetEditPopUp} />
      </Container>
      {isPetOpened && (
        <PetInfo
          method="patch"
          isOpend={isPetOpened}
          setIsOpened={setIsPetOpened}
          petId={petId}
          profile={uploadFileURL}
          name={name}
          age={age}
          sex={sex}
          information={information}
        />
      )}
      {isDeletePopUp && (
        <Popup
          title="해당 등록을 삭제하시겠습니까?"
          btnsize={['md', 'md']}
          buttontext={['삭제', '취소']}
          countbtn={2}
          isgreen={['true', 'false']}
          popupcontrol={() => {
            setIsDeletePopUp(false);
          }}
          handler={[
            handleDeletePet,
            () => {
              setIsDeletePopUp(false);
            },
          ]}
        />
      )}
      {isDelelteError && (
        <Popup
          title={'펫 삭제에 실패했습니다.'}
          handler={[
            () => {
              setIsDeleteError(false);
            },
          ]}
          isgreen={['true']}
          btnsize={['md']}
          buttontext={['확인']}
          countbtn={2}
          popupcontrol={() => {
            setIsDeleteError(false);
          }}
        />
      )}{' '}
      {isEditError && (
        <Popup
          title={'프로필 이미지 변경에 실패했습니다.'}
          handler={[
            () => {
              setIsEditError(false);
            },
          ]}
          isgreen={['true']}
          btnsize={['md']}
          buttontext={['확인']}
          countbtn={1}
          popupcontrol={() => {
            setIsEditError(false);
          }}
        />
      )}
    </>
  );
}
