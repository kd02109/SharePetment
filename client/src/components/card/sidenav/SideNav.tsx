import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import { patchFeedLike } from '../../../api/mutationfn';
import { SERVER_URL } from '../../../api/url';
import { ReactComponent as Comment } from '../../../assets/button/comment.svg';
import { ReactComponent as Like } from '../../../assets/button/like.svg';
import { ReactComponent as Share } from '../../../assets/button/share.svg';
import { BooleanStr } from '../../../types/propType';
import { Container, Wrap, Text } from './SideNav.styled';

interface Prop {
  feedid: number;
  direction: 'row' | 'col';
  likes: number;
  like: BooleanStr;
  guesthandler: () => void;
  url: string;
}

export default function SideNav({
  feedid,
  direction,
  likes,
  like,
  guesthandler,
}: // url,
Prop) {
  const accessToken = useReadLocalStorage<string | null>('accessToken');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: patchFeedLike,
    onSuccess: data => {
      console.log(data);
      queryClient.invalidateQueries({ queryKey: ['hostRandomFeed'] });
    },
  });

  const handleClickLike = () => {
    console.log(feedid);
    if (!accessToken) return guesthandler();
    const data = {
      url: `${SERVER_URL}feeds/like/${feedid}`,
      accessToken,
    };
    likeMutation.mutate(data);
  };

  const handleClickComment = () => {
    if (!accessToken) return guesthandler();
    navigate(`/home/${feedid}`);
  };

  return (
    <>
      <Container direction={direction}>
        <Wrap className="pl-2">
          {like === 'true' ? (
            <Like
              className="cursor-pointer"
              stroke="black"
              fill="#69B783"
              onClick={handleClickLike}
            />
          ) : (
            <Like
              className="cursor-pointer "
              stroke="black"
              onClick={handleClickLike}
            />
          )}

          <Text>{likes}</Text>
        </Wrap>

        <Wrap onClick={handleClickComment}>
          <Comment className="cursor-pointer ml-2" stroke="black" />
        </Wrap>

        <Wrap>
          <Share className="cursor-pointer ml-2" />
        </Wrap>
      </Container>
    </>
  );
}
