import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { useReadLocalStorage } from 'usehooks-ts';
import {
  addComment,
  deleteWalkFeed,
  patchWalkStatus,
} from '../../api/mutationfn';
import { getServerDataWithJwt } from '../../api/queryfn';
import { SERVER_URL } from '../../api/url';
import { ReactComponent as CommentIcon } from '../../assets/button/comment.svg';
import { ReactComponent as Delete } from '../../assets/button/delete.svg';
import { ReactComponent as Edit } from '../../assets/button/edit.svg';
import { ReactComponent as Calendar } from '../../assets/calendar.svg';
import { ReactComponent as Dog } from '../../assets/dog.svg';
import { ReactComponent as Chatlink } from '../../assets/link.svg';
import { ReactComponent as ArrowLeft } from '../../assets/mobile/arrow-left.svg';
import { ReactComponent as Pin } from '../../assets/pin.svg';
import Comment from '../../common/comment/Comment';
import Popup from '../../common/popup/Popup';
import LoadingComponent from '../../components/loading/LoadingComponent';
import ShowMap from '../../components/map-show/ShowMap';
import { MemberIdContext, State } from '../../store/Context';
import { WalkFeed } from '../../types/walkType';
import { changeDateFormat } from '../../util/changeDateFormat';
import {
  CommentButton,
  Divider,
  GatherMate,
  WalkInfo,
} from './WalkFeed.styled';

export function Component() {
  const navigate = useNavigate();
  const { postId } = useParams();
  const { memberId: userId } = useContext(MemberIdContext) as State;
  const accessToken = useReadLocalStorage<string | null>('accessToken');

  // 댓글 등록 실패 팝업
  const [isCommentError, setIsCommentError] = useState(false);

  // 모집 변경 실패 팝업
  const [isChangeError, setIsChangeError] = useState(false);

  // 댓글 등록
  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkFeed', postId] });
    },
    onError: () => {
      setIsCommentError(true);
    },
  });

  type FormValues = {
    content: string;
  };

  const { register, handleSubmit, resetField } = useForm<FormValues>();

  const onSubmit: SubmitHandler<FormValues> = data => {
    const url = `${SERVER_URL}/walkmates/comments/${postId}`;
    addCommentMutation.mutate({ ...data, url, accessToken });
    resetField('content');
  };

  const queryClient = useQueryClient();

  // 산책 게시글 가지고 오기
  const { data, isLoading } = useQuery<WalkFeed>({
    queryKey: ['walkFeed', postId],
    queryFn: () =>
      getServerDataWithJwt(
        `${SERVER_URL}/walkmates/bywalk/${postId}`,
        accessToken as string,
      ),
    onSuccess(data) {
      setAddress((data?.location as string) + ' ' + data?.mapURL.split(' ')[2]);
      setLat(data?.mapURL.split(' ')[0]);
      setLng(data?.mapURL.split(' ')[1]);
    },
  });

  const reversedData = data ? [...data.comments].reverse() : [];

  // 모집 변경
  const walkStatusMutation = useMutation({
    mutationFn: patchWalkStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['walkFeed', postId] });
    },
    onError: () => {
      setIsChangeError(true);
    },
  });

  const handleWalkStatus = () => {
    walkStatusMutation.mutate({
      url: `${SERVER_URL}/walkmates/openstatus/${!data?.open}/${
        data?.walkMatePostId
      }`,
      accessToken: accessToken as string,
    });
  };

  // 게시글 수정
  const handleWalkFeedEdit = () => {
    // 수정 페이지로 이동
    navigate(`/walk-posting/${data?.walkMatePostId}`);
  };

  // 게시글 삭제
  const walkDeleteMutation = useMutation({
    mutationFn: deleteWalkFeed,
    onSuccess: () => {
      navigate('/walkmate');
    },
    onError() {
      setIsOpened(false);
      setIsError(true);
    },
  });

  const [isOpened, setIsOpened] = useState(false);
  const handleWalkFeedDeletePopUp = () => {
    setIsOpened(true);
  };
  const handleWalkFeedDelete = () => {
    walkDeleteMutation.mutate({
      url: `${SERVER_URL}/walkmates/${data?.walkMatePostId}`,
      accessToken: accessToken as string,
    });
  };

  // error PopUp
  const [isError, setIsError] = useState(false);

  // 지도 그리기
  // 위도, 경도, 주소
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  return (
    <>
      {isLoading ? (
        <LoadingComponent />
      ) : (
        <div className="w-[500px] max-sm:w-[320px] mx-auto mt-7">
          <ArrowLeft
            className="hidden max-sm:block w-6 h-6"
            onClick={() => navigate('/walkmate')}
          />
          {`${data?.memberInfo?.memberId}` === userId && (
            <div className="flex justify-end gap-4 items-center">
              <button
                className="bg-deepgreen px-2 py-1 rounded-md text-white"
                onClick={handleWalkStatus}>
                모집변경
              </button>
              <Edit className="cursor-pointer" onClick={handleWalkFeedEdit} />
              <Delete
                className="cursor-pointer"
                onClick={handleWalkFeedDeletePopUp}
              />
            </div>
          )}
          {/* 제목부분 */}
          <div className="flex items-baseline gap-3 text-3xl font-[900] justify-start mb-7 mt-3">
            <GatherMate isopen={data?.open ? 'true' : 'false'}>
              {data?.open ? '모집중' : '모집완료'}
            </GatherMate>
            <h2 className="max-sm:text-xl">{data?.title}</h2>
          </div>
          {/* 산책정보 안내부분 */}
          <div className="grid grid-cols-2 gap-y-2 max-sm:grid-cols-1 mb-8">
            <WalkInfo>
              <Dog />
              <span>{data?.maximum}마리</span>
            </WalkInfo>
            <WalkInfo>
              <Calendar />
              <span>{changeDateFormat(data?.time as string)}</span>
            </WalkInfo>
            <WalkInfo>
              <Pin />
              <span>{address}</span>
            </WalkInfo>
            <WalkInfo>
              <Chatlink className=" shrink-0" />
              <a href={data?.chatURL as string} target="_blank">
                <span className=" break-all">{data?.chatURL}</span>
              </a>
            </WalkInfo>
          </div>
          {/* 본문 */}
          <div className="mb-7">{data?.content}</div>
          {/* 지도 이미지 부분 */}
          <ShowMap address={address} lat={lat} lng={lng} />

          <Divider />
          {/* 댓글 */}
          <div className="mt-5">
            <div className="flex items-center gap-1 text-deepgray mb-3">
              <CommentIcon className=" stroke-deepgray" />
              <span>댓글 {data?.comments?.length}</span>
            </div>
            {/* 댓글입력창 */}
            <form
              className="flex justify-between gap-2"
              onSubmit={handleSubmit(onSubmit)}>
              <input
                className=" w-full border-b border-lightgray bg-transparent outline-none"
                type="text"
                {...register('content', {
                  required: '댓글 작성시 텍스트 필수',
                  maxLength: {
                    value: 100,
                    message: '100자 이내로 입력해주세요 :)',
                  },
                })}
              />
              <CommentButton>Comment</CommentButton>
            </form>
            {/* 댓글 렌더링 */}
            <ul>
              {reversedData.map(comment => {
                return (
                  <Comment
                    key={comment.walkMateCommentId}
                    content={comment.content}
                    createdAt={comment.createdAt}
                    modifiedAt={comment.modifiedAt}
                    memberInfo={comment.memberInfo}
                    walkMateCommentId={comment.walkMateCommentId}
                    walkMatePostId={postId}
                  />
                );
              })}
            </ul>
          </div>
        </div>
      )}
      <>
        {isOpened && (
          <Popup
            countbtn={2}
            title="정말로 삭제하시겠습니까?"
            btnsize={['md', 'md']}
            isgreen={['true', 'false']}
            buttontext={['삭제', '취소']}
            popupcontrol={() => {
              setIsOpened(false);
            }}
            handler={[
              handleWalkFeedDelete,
              () => {
                setIsOpened(false);
              },
            ]}
          />
        )}
        {isError && (
          <Popup
            countbtn={1}
            title="게시글 삭제에 실패했습니다."
            btnsize={['md']}
            isgreen={['true']}
            buttontext={['확인']}
            popupcontrol={() => {
              setIsError(false);
            }}
            handler={[
              () => {
                setIsError(false);
              },
            ]}
          />
        )}
        {isCommentError && (
          <Popup
            countbtn={1}
            title="댓글 생성에 실패했습니다."
            btnsize={['md']}
            isgreen={['true']}
            buttontext={['확인']}
            popupcontrol={() => {
              setIsCommentError(false);
            }}
            handler={[
              () => {
                setIsCommentError(false);
              },
            ]}
          />
        )}
        {isChangeError && (
          <Popup
            countbtn={1}
            title="모집 변경에 실패했습니다."
            btnsize={['md']}
            isgreen={['true']}
            buttontext={['확인']}
            popupcontrol={() => {
              setIsChangeError(false);
            }}
            handler={[
              () => {
                setIsChangeError(false);
              },
            ]}
          />
        )}
      </>
    </>
  );
}

Component.displayName = 'WalkFeed';
