import { Bounty, isBounty } from './event/Bounty'
import { Post, isPost } from './event/Post'
import { WalletReview, isWalletReview } from './event/WalletReview'

const components = [
  {
    test: isBounty,
    component: Bounty,
  },
  {
    test: isWalletReview,
    component: WalletReview,
  },
  {
    test: isPost,
    component: Post,
  },
];

// thanks ChatGPT
function withComponentSelector(components) {
  return function ComponentSelector(props) {
    const Component = components
      .find( component => component.test(props) )
      .component;
    return <Component {...props} />;
  }
}

const ComponentSelector = withComponentSelector(components);

export function Event({
  showUser = true,
  isPreview = true,
  showReactions = false,
  showComments = false,
  event,
  reactions = [],
  relays = [],
  children,
  ...rest
}) {
  return <ComponentSelector
    showUser={showUser}
    isPreview={isPreview}
    showReactions={showReactions}
    showComments={showComments}
    event={event}
    reactions={reactions}
    relays={relays}
    children={children}
    {...rest} />
}

