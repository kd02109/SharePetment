import { useNavigate, Link } from 'react-router-dom';
import LoginPets from '../../assets/illustration/loginpet.png';
import { ReactComponent as Kakao } from '../../assets/kakao.svg';
import { ReactComponent as Logo } from '../../assets/logo.svg';
import Footer from '../../common/footer/Footer';
import { Container, LoginBtn, LoginText, GuestText } from './Login.styled';

export default function Login() {
  const navigate = useNavigate();

  return (
    <Container>
      <Logo width="400" className="max-sm:w-80" />
      <img src={LoginPets} width="500" />
      <Link to="https://kauth.kakao.com/oauth/authorize?client_id=07df97c2858e60b2e19f630c2c397b31&redirect_uri=http://43.202.86.53:8080/auth/kakao/callback&response_type=code">
        <LoginBtn>
          <Kakao />
          <LoginText>Log in With KaKao</LoginText>
        </LoginBtn>
      </Link>
      <GuestText onClick={() => navigate('/home')}>Guest로 시작하기</GuestText>
      <Footer />
    </Container>
  );
}
