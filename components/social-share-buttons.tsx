import React from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  TelegramShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  LinkedinIcon,
  TelegramIcon
} from 'react-share';

interface SocialShareButtonsProps {
  url: string;
  title: string;
  size?: number;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({
  url,
  title,
  size = 32
}) => {
  const shareButtons = [
    {
      Button: FacebookShareButton,
      Icon: FacebookIcon,
      name: 'Facebook'
    },
    {
      Button: TwitterShareButton,
      Icon: TwitterIcon,
      name: 'Twitter'
    },
    {
      Button: WhatsappShareButton,
      Icon: WhatsappIcon,
      name: 'WhatsApp'
    },
    {
      Button: LinkedinShareButton,
      Icon: LinkedinIcon,
      name: 'LinkedIn'
    },
    {
      Button: TelegramShareButton,
      Icon: TelegramIcon,
      name: 'Telegram'
    }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-600">Partager sur :</span>
      <div className="flex gap-2">
        {shareButtons.map(({ Button, Icon, name }) => (
          <Button
            key={name}
            url={url}
            title={title}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
          >
            <Icon size={size} round />
            <span className="sr-only">Partager sur {name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default SocialShareButtons;