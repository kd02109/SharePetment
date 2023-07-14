import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useReadLocalStorage } from 'usehooks-ts';
import { deleteComment, editComment } from '../../api/mutationfn';
import { SERVER_URL } from '../../api/url';
import { ReactComponent as Write } from '../../assets/button/write.svg';
import { MemberIdContext } from '../../store/Context';
import { CommentProp } from '../../types/commentType';
import changeTime from '../../util/changeTiem';
import Popup from '../popup/Popup';
import Profile from '../profile/Profile';
import {
  Container,
  ContentBox,
  DateText,
  UserBox,
  UserName,
  EditBtn,
  DeleteBtn,
  BtnBox,
  Content,
  HeaderBox,
  Input,
  WriteBtn,
  Form,
} from './comment.styled';

type Inputs = {
  comment: string;
};

export default function Comment(props: CommentProp) {
  const {
    memberInfo: { memberId, imageURL, nickname },
    createdAt,
    content,
    feedCommentsId,
    walkMateCommentId,
    walkMatePostId,
  } = props;

  // const userId = useReadLocalStorage('memberId');
  const userId = useContext(MemberIdContext);

  const accessToken = useReadLocalStorage<string | null>('accessToken');

  const [isEdited, setIsEdited] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [text] = useState(content);

  const { register, handleSubmit, setFocus } = useForm<Inputs>();

  // useHookForm 댓글 수정
  const handleEditText = (data: Inputs) => {
    const newComment = data.comment;
    const postData = {
      id: feedCommentsId ? `${feedCommentsId}` : `${walkMateCommentId}`,
      content: newComment,
      url: feedCommentsId
        ? `${SERVER_URL}/feeds/comments/${feedCommentsId}`
        : `${SERVER_URL}/walkmates/comments/${walkMateCommentId}`,
      tag: feedCommentsId ? 'feed' : 'walk',
      accessToken,
    };
    mutation.mutate(postData);
  };

  // 산책 댓글 삭제
  const handleDeleteComment = (walkMateCommentId: number | undefined) => {
    const data = {
      url: `${SERVER_URL}/walkmates/comments/${walkMateCommentId}`,
      accessToken,
    };
    deleteCommentMutaion.mutate(data);
  };

  const onSubmit: SubmitHandler<Inputs> = data => handleEditText(data);

  useEffect(() => {
    setFocus('comment');
  }, [setFocus, isEdited]);

  const queryClient = useQueryClient();
  // mutation
  const mutation = useMutation({
    mutationFn: editComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkFeed', walkMatePostId] });
      setIsEdited(false);
    },
    onError: error => console.log(error),
  });

  const deleteCommentMutaion = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkFeed', walkMatePostId] });
    },
  });

  return (
    <>
      <Container>
        <div>
          {/* 유저 정보 기입 */}
          <HeaderBox>
            <UserBox>
              <Profile size="sm" url={imageURL} isgreen={'false'} />
              <UserName>{nickname}</UserName>
              <DateText>{changeTime(createdAt)}</DateText>
            </UserBox>
            {userId === `${memberId}` && (
              <BtnBox>
                <EditBtn
                  onClick={() => {
                    setIsEdited(prev => !prev);
                  }}>
                  수정
                </EditBtn>
                <DeleteBtn
                  onClick={() => {
                    setIsDeleted(true);
                  }}>
                  삭제
                </DeleteBtn>
              </BtnBox>
            )}
          </HeaderBox>
          {/* 댓글 작성 */}
          <ContentBox>
            {isEdited ? (
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Input
                  defaultValue={text}
                  {...register('comment', {
                    required: true,
                    maxLength: 100,
                  })}
                />
                <WriteBtn>
                  <Write type="submit" />
                </WriteBtn>
              </Form>
            ) : (
              <Content>{content}</Content>
            )}
          </ContentBox>
        </div>
      </Container>
      {mutation.isError && (
        <Popup
          title="댓글 수정에 실패했습니다."
          handler={[
            () => {
              window.location.reload();
            },
          ]}
          btnsize={['md']}
          buttontext={['확인']}
          isgreen={['true']}
          countbtn={1}
          popupcontrol={() => {
            window.location.reload();
          }}
        />
      )}
      {isDeleted && (
        <Popup
          title="정말로 삭제하시겠습니까?"
          handler={[
            () => {
              //delete 메서드 진행
              setIsDeleted(false);
              handleDeleteComment(walkMateCommentId);
            },
            () => {
              //delete 메서드 진행
              setIsDeleted(false);
            },
          ]}
          btnsize={['md', 'md']}
          buttontext={['확인', '취소']}
          isgreen={['true', 'false']}
          countbtn={2}
          popupcontrol={() => {
            setIsDeleted(false);
          }}
        />
      )}
    </>
  );
}
