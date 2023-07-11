import { ReactComponent as Man } from '../../../assets/label/man.svg';
import { ReactComponent as Woman } from '../../../assets/label/woman.svg';
import Profile from '../../../common/profile/Profile';
import { Container, Info, Name, NameBox, TextBox } from './petInfoBox.styled';

interface Prop {
  name: string;
  information: string;
  uploadFileUrl: string;
  sex: string;
}

export default function PetInfoBox(prop: Prop) {
  const { name, information, uploadFileUrl, sex } = prop;
  return (
    <Container>
      <Profile isgreen="false" size="sm" url={uploadFileUrl} />
      <TextBox>
        <NameBox>
          <Name>{name}</Name>
          {sex === '수컷' ? <Man /> : <Woman />}
        </NameBox>
        <Info>{information}</Info>
      </TextBox>
    </Container>
  );
}
