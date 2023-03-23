import { useCallback } from "react";

import { TwitterTweetEmbed } from "react-twitter-embed";

// eslint-disable-next-line no-useless-escape
const FileExtensionRegex = /\.([\w]+)$/i;
const TweetUrlRegex =
  /https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(?:es)?\/(\d+)/;

export default function HyperText({
  link,
  children,
}: {
  link: string;
  children: any;
}) {
  const render = useCallback(() => {
    try {
      const url = new URL(link);
      const extension =
        FileExtensionRegex.test(url.pathname.toLowerCase()) && RegExp.$1;
      const tweetId = TweetUrlRegex.test(link) && RegExp.$2;
      if (extension) {
        switch (extension) {
          case "gif":
          case "jpg":
          case "jpeg":
          case "png":
          case "bmp":
          case "webp": {
            return (
              <img
                alt={url.toString()}
                key={url.toString()}
                src={url.toString()}
              />
            );
          }
          case "wav":
          case "mp3":
          case "ogg": {
            return <audio key={url.toString()} src={url.toString()} controls />;
          }
          case "mp4":
          case "mov":
          case "mkv":
          case "avi":
          case "m4v":
          case "webm": {
            return <video key={url.toString()} src={url.toString()} controls />;
          }
          default:
            return (
              <a
                key={url.toString()}
                href={url.toString()}
                target="_blank"
                rel="noreferrer"
                className="ext"
              >
                {children || url.toString()}
              </a>
            );
        }
      } else if (tweetId) {
        return (
          <div key={tweetId}>
            <TwitterTweetEmbed tweetId={tweetId} />
          </div>
        );
      } else {
        return (
          <a href={link} target="_blank" rel="noreferrer" className="ext">
            {children || link}
          </a>
        );
      }
    } catch (error) {
      // Ignore the error.
    }
    return (
      <a href={link} target="_blank" rel="noreferrer" className="ext">
        {children || link}
      </a>
    );
  }, [link, children]);

  return render();
}
