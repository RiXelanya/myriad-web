import {FriendDetail} from 'src/components/FriendsMenu/hooks/use-friend-list.hook';
import {Comment} from 'src/interfaces/comment';
import {SectionType, Vote} from 'src/interfaces/interaction';
import {User} from 'src/interfaces/user';

export interface CommentDetailProps {
  section: SectionType;
  user?: User;
  comment: Comment;
  deep: number;
  mentionables: FriendDetail[];
  blockedUserIds: string[];
  onUpvote: (comment: Comment) => void;
  onRemoveVote: (comment: Comment) => void;
  onUpdateDownvote: (commentId: string, total: number, vote: Vote) => void;
  onOpenTipHistory: (comment: Comment) => void;
  onSendTip: (comment: Comment) => void;
  onReport: (comment: Comment) => void;
  onSearchPeople: (query: string) => void;
  onBeforeDownvote?: () => void;
}